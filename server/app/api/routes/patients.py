from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.patient_service import (
    create_patient,
    get_patient_dashboard,
    get_patient_or_404,
    list_patients,
    to_patient_out,
    update_patient,
)

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("")
def read_patients(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    keyword: Annotated[str | None, Query(max_length=80)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> dict[str, object]:
    return success_response(list_patients(db, current_user, keyword, page, page_size))


@router.post("")
def create_patient_endpoint(
    payload: PatientCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(create_patient(db, current_user, payload))


@router.get("/{patient_id}")
def read_patient(
    patient_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(to_patient_out(get_patient_or_404(db, current_user, patient_id)))


@router.put("/{patient_id}")
def update_patient_endpoint(
    patient_id: str,
    payload: PatientUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_patient(db, current_user, patient_id, payload))


@router.get("/{patient_id}/dashboard")
def read_patient_dashboard(
    patient_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_patient_dashboard(db, current_user, patient_id))
