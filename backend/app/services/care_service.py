from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.schemas.care import (
    CareWorkbenchPatient,
    CareWorkbenchRecord,
    CareWorkbenchResponse,
    CareWorkbenchSummary,
    CareWorkbenchTask,
)
from app.services.record_service import record_value_text
from app.services.task_service import is_task_overdue


def get_care_workbench(db: Session, user: User) -> CareWorkbenchResponse:
    patient_count = db.scalar(select(func.count(Patient.id)).where(Patient.user_id == user.id)) or 0
    record_count = (
        db.scalar(select(func.count(CareRecord.id)).join(Patient).where(Patient.user_id == user.id)) or 0
    )
    pending_task_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(Patient.user_id == user.id, CareTask.status != "completed")
        )
        or 0
    )
    tasks_for_overdue = db.scalars(
        select(CareTask).join(Patient).where(Patient.user_id == user.id, CareTask.status != "completed")
    ).all()
    overdue_task_count = sum(1 for task in tasks_for_overdue if is_task_overdue(task))

    patients = db.scalars(
        select(Patient)
        .where(Patient.user_id == user.id)
        .order_by(Patient.created_at.desc())
        .limit(10)
    ).all()
    records = db.execute(
        select(CareRecord, Patient.name)
        .join(Patient)
        .where(Patient.user_id == user.id)
        .options(selectinload(CareRecord.metrics))
        .order_by(CareRecord.occurred_at.desc())
        .limit(10)
    ).all()
    tasks = db.execute(
        select(CareTask, Patient.name)
        .join(Patient)
        .where(Patient.user_id == user.id, CareTask.status != "completed")
        .order_by(CareTask.remind_time.asc())
        .limit(10)
    ).all()

    return CareWorkbenchResponse(
        summary=CareWorkbenchSummary(
            patient_count=patient_count,
            record_count=record_count,
            pending_task_count=pending_task_count,
            overdue_task_count=overdue_task_count,
        ),
        patients=[
            CareWorkbenchPatient(
                id=patient.id,
                name=patient.name,
                age=patient.age,
                gender=patient.gender,
                profile_note=patient.profile_note,
            )
            for patient in patients
        ],
        recent_records=[
            CareWorkbenchRecord(
                id=record.id,
                patient_id=record.patient_id,
                patient_name=patient_name,
                record_type=record.record_type,
                occurred_at=record.occurred_at.isoformat(),
                notes=record.notes,
                source=record.source,
                value_text=record_value_text(record),
            )
            for record, patient_name in records
        ],
        upcoming_tasks=[
            CareWorkbenchTask(
                id=task.id,
                patient_id=task.patient_id,
                patient_name=patient_name,
                title=task.title,
                description=task.description,
                task_type=task.task_type,
                remind_time=task.remind_time.isoformat(),
                repeat_rule=task.repeat_rule,
                priority=task.priority,
                remind_offset_minutes=task.remind_offset_minutes,
                status=task.status,
                is_overdue=is_task_overdue(task),
            )
            for task, patient_name in tasks
        ],
    )
