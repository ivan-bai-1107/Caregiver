from app.schemas.base import CamelModel


class TrendPoint(CamelModel):
    occurred_at: str
    value: float


class TrendSeries(CamelModel):
    patient_id: str
    metric_type: str
    points: list[TrendPoint]


class TrendAnalysis(CamelModel):
    patient_id: str
    metric_type: str
    summary: str
    risk_level: str
    highlights: list[str]
    suggestions: list[str]
    risk_note: str
    generated_by: str
