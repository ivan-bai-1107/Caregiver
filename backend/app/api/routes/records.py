from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.care_record import CareRecordCreate, CareRecordUpdate
from app.services.record_service import create_record, get_record_or_404, list_records, to_record_out, update_record

router = APIRouter(prefix="/care-records", tags=["care-records"])


@router.get("")
def read_records(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(list_records(db, current_user))


@router.post("")
def create_record_endpoint(
    payload: CareRecordCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(create_record(db, current_user, payload))


@router.get("/{record_id}")
def read_record(
    record_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(to_record_out(get_record_or_404(db, current_user, record_id)))


@router.put("/{record_id}")
def update_record_endpoint(
    record_id: str,
    payload: CareRecordUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_record(db, current_user, record_id, payload))
