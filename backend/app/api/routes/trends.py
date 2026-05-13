from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.services.trend_service import get_metric_trend

router = APIRouter(prefix="/patients", tags=["trends"])


@router.get("/{patient_id}/metrics/trend")
def read_metric_trend(
    patient_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    metric_type: Annotated[str, Query(alias="metricType")],
    start_at: Annotated[datetime | None, Query(alias="startAt")] = None,
    end_at: Annotated[datetime | None, Query(alias="endAt")] = None,
) -> dict[str, object]:
    return success_response(get_metric_trend(db, current_user, patient_id, metric_type, start_at, end_at))
