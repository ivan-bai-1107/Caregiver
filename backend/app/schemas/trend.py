from app.schemas.base import CamelModel


class TrendPoint(CamelModel):
    occurred_at: str
    value: float


class TrendSeries(CamelModel):
    patient_id: str
    metric_type: str
    points: list[TrendPoint]
