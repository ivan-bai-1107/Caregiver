from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel

RecordType = Literal[
    "blood_pressure",
    "temperature",
    "blood_sugar",
    "heart_rate",
    "medication",
    "diet",
    "other",
]
RecordSource = Literal["manual", "ai"]
MetricValue = float | int | str


class CareMetricIn(CamelModel):
    key: str = Field(min_length=1, max_length=80)
    value: MetricValue
    unit: str | None = None


class CareMetricOut(CamelModel):
    key: str
    value: MetricValue
    unit: str | None = None


class CareRecordCreate(CamelModel):
    patient_id: str
    record_type: RecordType
    occurred_at: datetime
    notes: str = ""
    source: RecordSource = "manual"
    metrics: list[CareMetricIn] = Field(default_factory=list)


class CareRecordUpdate(CareRecordCreate):
    pass


class CareRecordOut(CamelModel):
    id: str
    patient_id: str
    record_type: RecordType
    occurred_at: datetime
    notes: str
    source: RecordSource
    metrics: list[CareMetricOut]
