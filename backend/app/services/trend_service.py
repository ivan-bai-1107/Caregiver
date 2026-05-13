from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.user import User
from app.schemas.trend import TrendPoint, TrendSeries
from app.services.patient_service import get_patient_or_404

METRIC_TYPE_MAP = {
    "blood_pressure_systolic": "bloodPressureSystolic",
    "blood_pressure_diastolic": "bloodPressureDiastolic",
    "bloodPressureSystolic": "bloodPressureSystolic",
    "bloodPressureDiastolic": "bloodPressureDiastolic",
    "blood_sugar": "bloodSugar",
    "bloodSugar": "bloodSugar",
    "temperature": "temperature",
    "heart_rate": "heartRate",
    "heartRate": "heartRate",
}


def get_metric_trend(
    db: Session,
    user: User,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> TrendSeries:
    patient = get_patient_or_404(db, user, patient_id)
    metric_key = METRIC_TYPE_MAP.get(metric_type, metric_type)
    statement = (
        select(CareRecord.occurred_at, CareMetric.value_numeric)
        .join(CareMetric, CareMetric.care_record_id == CareRecord.id)
        .where(
            CareRecord.patient_id == patient.id,
            CareMetric.metric_key == metric_key,
            CareMetric.value_numeric.is_not(None),
        )
        .order_by(CareRecord.occurred_at.asc())
    )
    if start_at is not None:
        statement = statement.where(CareRecord.occurred_at >= start_at)
    if end_at is not None:
        statement = statement.where(CareRecord.occurred_at <= end_at)

    rows = db.execute(statement).all()
    return TrendSeries(
        patient_id=patient.id,
        metric_type=metric_type,
        points=[
            TrendPoint(occurred_at=occurred_at.isoformat(), value=float(value_numeric))
            for occurred_at, value_numeric in rows
        ],
    )
