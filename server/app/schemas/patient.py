from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel
from app.schemas.care_record import CareMetricOut

PatientGender = Literal["男", "女", "其他"]


class PatientCreate(CamelModel):
    name: str = Field(min_length=1, max_length=80)
    age: int = Field(ge=0, le=130)
    gender: PatientGender
    profile_note: str = Field(default="", max_length=2000)


class PatientUpdate(PatientCreate):
    pass


class PatientOut(CamelModel):
    id: str
    user_id: str
    name: str
    age: int
    gender: PatientGender
    profile_note: str


class PatientOverview(CamelModel):
    record_count: int
    pending_task_count: int
    trend_window_days: int


class PatientRecentRecord(CamelModel):
    id: str
    record_type: str
    occurred_at: str
    source: str
    is_confirmed: bool = True
    value_text: str
    notes: str
    metrics: list[CareMetricOut]


class PatientUpcomingTask(CamelModel):
    id: str
    patient_id: str
    title: str
    description: str
    task_type: str
    remind_time: str
    repeat_rule: str
    priority: str
    remind_offset_minutes: int
    status: str
    patient_name: str
    is_overdue: bool


class PatientTrendPreviewPoint(CamelModel):
    date: str
    systolic: float | None = None
    diastolic: float | None = None


class PatientTrendPreview(CamelModel):
    metric_key: str = "blood_pressure"
    chart_data: list[PatientTrendPreviewPoint]
    average_systolic: float
    average_diastolic: float
    change_percent: float


class PatientDashboard(CamelModel):
    patient: PatientOut
    condition_summary: str
    overview: PatientOverview
    recent_records: list[PatientRecentRecord]
    upcoming_tasks: list[PatientUpcomingTask]
    trend_preview: PatientTrendPreview
