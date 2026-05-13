from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.care_task import CareTaskCreate, CareTaskUpdate
from app.services.task_service import complete_task, create_task, get_task_or_404, list_tasks, to_task_out, update_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
def read_tasks(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(list_tasks(db, current_user))


@router.post("")
def create_task_endpoint(
    payload: CareTaskCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(create_task(db, current_user, payload))


@router.get("/{task_id}")
def read_task(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(to_task_out(get_task_or_404(db, current_user, task_id)))


@router.put("/{task_id}")
def update_task_endpoint(
    task_id: str,
    payload: CareTaskUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_task(db, current_user, task_id, payload))


@router.post("/{task_id}/complete")
def complete_task_endpoint(
    task_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(complete_task(db, current_user, task_id))
