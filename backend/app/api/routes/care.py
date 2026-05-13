from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.services.care_service import get_care_workbench

router = APIRouter(prefix="/care", tags=["care"])


@router.get("/workbench")
def read_care_workbench(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_care_workbench(db, current_user))
