from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.ai import AiAssistantRequest
from app.services.ai_service import handle_assistant_message

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/assistant")
def assistant(
    payload: AiAssistantRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(handle_assistant_message(db, current_user, payload))
