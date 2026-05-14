from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.schemas.home import (
    HomeHealthAlert,
    HomeSummary,
    HomeSummaryResponse,
    HomeTaskItem,
    RecentPatientCard,
)


def get_metric_alert(metric_key: str, value: float) -> tuple[str, str] | None:
    if metric_key == "bloodPressureSystolic" and value >= 140:
        return "收缩压偏高，请关注近期血压变化。", "warning"
    if metric_key == "bloodPressureDiastolic" and value >= 90:
        return "舒张压偏高，请关注近期血压变化。", "warning"
    if metric_key == "bloodSugar" and value >= 11.1:
        return "血糖读数偏高，请按护理计划复测。", "warning"
    if metric_key == "temperature" and value >= 37.5:
        return "体温偏高，请继续观察。", "warning"
    if metric_key == "heartRate" and value >= 100:
        return "心率偏快，请记录状态并持续观察。", "warning"
    return None


def get_home_summary(db: Session, user: User) -> HomeSummaryResponse:
    pending_task_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(Patient.user_id == user.id, CareTask.status != "completed")
        )
        or 0
    )
    completed_task_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(Patient.user_id == user.id, CareTask.status == "completed")
        )
        or 0
    )
    task_items = db.execute(
        select(CareTask, Patient.name)
        .join(Patient)
        .where(Patient.user_id == user.id, CareTask.status != "completed")
        .order_by(CareTask.remind_time.asc())
        .limit(5)
    ).all()
    metric_rows = db.execute(
        select(CareMetric, CareRecord, Patient)
        .join(CareRecord, CareMetric.care_record_id == CareRecord.id)
        .join(Patient, CareRecord.patient_id == Patient.id)
        .where(Patient.user_id == user.id, CareMetric.value_numeric.is_not(None))
        .order_by(CareRecord.occurred_at.desc())
        .limit(20)
    ).all()

    health_alerts: list[HomeHealthAlert] = []
    for metric, record, patient in metric_rows:
        alert = get_metric_alert(metric.metric_key, float(metric.value_numeric))
        if alert is None:
            continue
        message, severity = alert
        health_alerts.append(
            HomeHealthAlert(
                id=f"alert_{metric.id}",
                patient_id=patient.id,
                patient_name=patient.name,
                message=message,
                severity=severity,
                occurred_at=record.occurred_at.isoformat(),
            )
        )
        if len(health_alerts) >= 5:
            break

    recent_patient_rows = db.execute(
        select(Patient, func.max(CareRecord.occurred_at))
        .outerjoin(CareRecord, CareRecord.patient_id == Patient.id)
        .where(Patient.user_id == user.id)
        .group_by(Patient.id)
        .order_by(func.max(CareRecord.occurred_at).desc().nullslast(), Patient.created_at.desc())
        .limit(5)
    ).all()

    return HomeSummaryResponse(
        summary=HomeSummary(
            pending_task_count=pending_task_count,
            completed_task_count=completed_task_count,
            health_alert_count=len(health_alerts),
            task_reminder_count=len(task_items),
        ),
        health_alerts=health_alerts,
        task_items=[
            HomeTaskItem(
                id=task.id,
                patient_id=task.patient_id,
                patient_name=patient_name,
                title=task.title,
                remind_time=task.remind_time.isoformat(),
                status=task.status,
                priority=task.priority,
            )
            for task, patient_name in task_items
        ],
        recent_patients=[
            RecentPatientCard(
                patient_id=patient.id,
                name=patient.name,
                age=patient.age,
                condition_summary=patient.profile_note or "护理说明待补充",
                status="attention" if any(alert.patient_id == patient.id for alert in health_alerts) else "stable",
                last_activity_at=last_activity.isoformat() if last_activity else None,
            )
            for patient, last_activity in recent_patient_rows
        ],
    )
