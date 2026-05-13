from collections import defaultdict
from datetime import timedelta
from statistics import mean

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.models.utils import utc_now
from app.schemas.base import PagedResponse
from app.schemas.patient import (
    PatientCreate,
    PatientDashboard,
    PatientOut,
    PatientOverview,
    PatientRecentRecord,
    PatientTrendPreview,
    PatientTrendPreviewPoint,
    PatientUpcomingTask,
    PatientUpdate,
)
from app.services.record_service import metric_to_out, record_value_text
from app.services.task_service import is_task_overdue


def get_patient_or_404(db: Session, user: User, patient_id: str) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.id == patient_id, Patient.user_id == user.id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="患者不存在。")
    return patient


def to_patient_out(patient: Patient) -> PatientOut:
    return PatientOut(
        id=patient.id,
        user_id=patient.user_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        profile_note=patient.profile_note,
    )


def list_patients(db: Session, user: User) -> PagedResponse[PatientOut]:
    patients = db.scalars(
        select(Patient)
        .where(Patient.user_id == user.id)
        .order_by(Patient.created_at.desc())
    ).all()
    return PagedResponse(
        items=[to_patient_out(patient) for patient in patients],
        total=len(patients),
    )


def create_patient(db: Session, user: User, payload: PatientCreate) -> PatientOut:
    patient = Patient(
        user_id=user.id,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        profile_note=payload.profile_note,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return to_patient_out(patient)


def update_patient(db: Session, user: User, patient_id: str, payload: PatientUpdate) -> PatientOut:
    patient = get_patient_or_404(db, user, patient_id)
    patient.name = payload.name
    patient.age = payload.age
    patient.gender = payload.gender
    patient.profile_note = payload.profile_note
    db.commit()
    db.refresh(patient)
    return to_patient_out(patient)


def build_patient_trend_preview(db: Session, patient: Patient) -> PatientTrendPreview:
    since = utc_now() - timedelta(days=30)
    rows = db.execute(
        select(CareRecord.occurred_at, CareMetric.metric_key, CareMetric.value_numeric)
        .join(CareMetric, CareMetric.care_record_id == CareRecord.id)
        .where(
            CareRecord.patient_id == patient.id,
            CareRecord.occurred_at >= since,
            CareMetric.metric_key.in_(["bloodPressureSystolic", "bloodPressureDiastolic"]),
            CareMetric.value_numeric.is_not(None),
        )
        .order_by(CareRecord.occurred_at.asc())
    ).all()

    grouped: dict[str, dict[str, float | str]] = defaultdict(dict)
    systolic_values: list[float] = []
    diastolic_values: list[float] = []

    for occurred_at, metric_key, value_numeric in rows:
        date_key = occurred_at.date().isoformat()
        value = float(value_numeric)
        grouped[date_key]["date"] = date_key
        if metric_key == "bloodPressureSystolic":
            grouped[date_key]["systolic"] = value
            systolic_values.append(value)
        if metric_key == "bloodPressureDiastolic":
            grouped[date_key]["diastolic"] = value
            diastolic_values.append(value)

    chart_data = [
        PatientTrendPreviewPoint(
            date=str(value.get("date", date_key)),
            systolic=value.get("systolic") if isinstance(value.get("systolic"), float) else None,
            diastolic=value.get("diastolic") if isinstance(value.get("diastolic"), float) else None,
        )
        for date_key, value in sorted(grouped.items())
    ]
    first_systolic = systolic_values[0] if systolic_values else 0
    last_systolic = systolic_values[-1] if systolic_values else 0
    change_percent = 0.0
    if first_systolic:
        change_percent = round((last_systolic - first_systolic) / first_systolic * 100, 1)

    return PatientTrendPreview(
        chart_data=chart_data,
        average_systolic=round(mean(systolic_values), 1) if systolic_values else 0,
        average_diastolic=round(mean(diastolic_values), 1) if diastolic_values else 0,
        change_percent=change_percent,
    )


def get_patient_dashboard(db: Session, user: User, patient_id: str) -> PatientDashboard:
    patient = get_patient_or_404(db, user, patient_id)
    record_count = db.scalar(select(func.count(CareRecord.id)).where(CareRecord.patient_id == patient.id)) or 0
    pending_task_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .where(CareTask.patient_id == patient.id, CareTask.status != "completed")
        )
        or 0
    )
    recent_records = db.scalars(
        select(CareRecord)
        .where(CareRecord.patient_id == patient.id)
        .options(selectinload(CareRecord.metrics))
        .order_by(CareRecord.occurred_at.desc())
        .limit(5)
    ).all()
    upcoming_tasks = db.scalars(
        select(CareTask)
        .where(CareTask.patient_id == patient.id, CareTask.status != "completed")
        .order_by(CareTask.remind_time.asc())
        .limit(5)
    ).all()

    return PatientDashboard(
        patient=to_patient_out(patient),
        condition_summary=patient.profile_note or "护理说明待补充。",
        overview=PatientOverview(
            record_count=record_count,
            pending_task_count=pending_task_count,
            trend_window_days=30,
        ),
        recent_records=[
            PatientRecentRecord(
                id=record.id,
                record_type=record.record_type,
                occurred_at=record.occurred_at.isoformat(),
                source=record.source,
                value_text=record_value_text(record),
                notes=record.notes,
                metrics=[metric_to_out(metric) for metric in record.metrics],
            )
            for record in recent_records
        ],
        upcoming_tasks=[
            PatientUpcomingTask(
                id=task.id,
                patient_id=task.patient_id,
                title=task.title,
                description=task.description,
                task_type=task.task_type,
                remind_time=task.remind_time.isoformat(),
                repeat_rule=task.repeat_rule,
                priority=task.priority,
                remind_offset_minutes=task.remind_offset_minutes,
                status=task.status,
                patient_name=patient.name,
                is_overdue=is_task_overdue(task),
            )
            for task in upcoming_tasks
        ],
        trend_preview=build_patient_trend_preview(db, patient),
    )
