from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.schemas.base import PagedResponse
from app.schemas.care_task import CareTaskCreate, CareTaskOut, CareTaskUpdate
from app.services.record_service import ensure_patient_belongs_to_user


def get_task_or_404(db: Session, user: User, task_id: str) -> CareTask:
    task = db.scalar(
        select(CareTask)
        .join(Patient)
        .where(CareTask.id == task_id, Patient.user_id == user.id)
    )
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="护理任务不存在。")
    return task


def to_task_out(task: CareTask) -> CareTaskOut:
    return CareTaskOut(
        id=task.id,
        patient_id=task.patient_id,
        title=task.title,
        description=task.description,
        task_type=task.task_type,
        remind_time=task.remind_time,
        repeat_rule=task.repeat_rule,
        priority=task.priority,
        remind_offset_minutes=task.remind_offset_minutes,
        status=task.status,
    )


def is_task_overdue(task: CareTask) -> bool:
    if task.status == "completed":
        return False
    remind_time = task.remind_time
    if remind_time.tzinfo is None:
        remind_time = remind_time.replace(tzinfo=timezone.utc)
    return remind_time < datetime.now(timezone.utc)


def list_tasks(
    db: Session,
    user: User,
    patient_id: str | None = None,
    status_filter: str | None = None,
    repeat_rule: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> PagedResponse[CareTaskOut]:
    filters = [Patient.user_id == user.id]
    if patient_id:
        filters.append(CareTask.patient_id == patient_id)
    if status_filter:
        filters.append(CareTask.status == status_filter)
    if repeat_rule:
        filters.append(CareTask.repeat_rule == repeat_rule)

    total = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(*filters)
        )
        or 0
    )
    tasks = db.scalars(
        select(CareTask)
        .join(Patient)
        .where(*filters)
        .order_by(CareTask.remind_time.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_task_out(task) for task in tasks],
        page=page,
        page_size=page_size,
        total=total,
    )


def create_task(db: Session, user: User, payload: CareTaskCreate) -> CareTaskOut:
    ensure_patient_belongs_to_user(db, user, payload.patient_id)
    task = CareTask(
        patient_id=payload.patient_id,
        title=payload.title,
        description=payload.description,
        task_type=payload.task_type,
        remind_time=payload.remind_time,
        repeat_rule=payload.repeat_rule,
        priority=payload.priority,
        remind_offset_minutes=payload.remind_offset_minutes,
        status=payload.status,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return to_task_out(task)


def update_task(db: Session, user: User, task_id: str, payload: CareTaskUpdate) -> CareTaskOut:
    ensure_patient_belongs_to_user(db, user, payload.patient_id)
    task = get_task_or_404(db, user, task_id)
    task.patient_id = payload.patient_id
    task.title = payload.title
    task.description = payload.description
    task.task_type = payload.task_type
    task.remind_time = payload.remind_time
    task.repeat_rule = payload.repeat_rule
    task.priority = payload.priority
    task.remind_offset_minutes = payload.remind_offset_minutes
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return to_task_out(task)


def complete_task(db: Session, user: User, task_id: str) -> CareTaskOut:
    task = get_task_or_404(db, user, task_id)
    task.status = "completed"
    db.commit()
    db.refresh(task)
    return to_task_out(task)
