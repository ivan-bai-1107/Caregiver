from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.redis import redis_get_json, redis_set_json
from app.core.responses import serialize_payload, success_response
from app.models.user import User
from app.services.cache_service import care_workbench_cache_key
from app.services.care_service import get_care_workbench

router = APIRouter(prefix="/care", tags=["care"])


@router.get("/workbench")
def read_care_workbench(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    cache_key = care_workbench_cache_key(current_user.id)
    cached = redis_get_json(cache_key)
    if cached is not None:
        return success_response(cached)

    workbench = get_care_workbench(db, current_user)
    redis_set_json(cache_key, 30, serialize_payload(workbench))
    return success_response(workbench)
