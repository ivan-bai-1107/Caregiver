from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel

CareTaskType = Literal[
    "blood_pressure",
    "blood_sugar",
    "medication",
    "diet",
    "rehab",
    "appointment",
    "nutrition",
    "other",
]
RepeatRule = Literal["once", "daily", "weekly", "monthly"]
Priority = Literal["low", "normal", "high"]
TaskStatus = Literal["pending", "completed", "scheduled"]


class CareTaskCreate(CamelModel):
    patient_id: str
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    task_type: CareTaskType
    remind_time: datetime
    repeat_rule: RepeatRule = "once"
    priority: Priority = "normal"
    remind_offset_minutes: int = Field(default=15, ge=0)
    status: TaskStatus = "pending"


class CareTaskUpdate(CareTaskCreate):
    pass


class CareTaskOut(CamelModel):
    id: str
    patient_id: str
    title: str
    description: str
    task_type: CareTaskType
    remind_time: datetime
    repeat_rule: RepeatRule
    priority: Priority
    remind_offset_minutes: int
    status: TaskStatus
