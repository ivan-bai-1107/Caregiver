from app.schemas.base import CamelModel


class CareWorkbenchSummary(CamelModel):
    patient_count: int
    record_count: int
    pending_task_count: int
    overdue_task_count: int


class CareWorkbenchPatient(CamelModel):
    id: str
    name: str
    age: int
    gender: str
    profile_note: str


class CareWorkbenchRecord(CamelModel):
    id: str
    patient_id: str
    patient_name: str
    record_type: str
    occurred_at: str
    notes: str
    source: str
    value_text: str


class CareWorkbenchTask(CamelModel):
    id: str
    patient_id: str
    patient_name: str
    title: str
    description: str
    task_type: str
    remind_time: str
    repeat_rule: str
    priority: str
    remind_offset_minutes: int
    status: str
    is_overdue: bool


class CareWorkbenchResponse(CamelModel):
    summary: CareWorkbenchSummary
    patients: list[CareWorkbenchPatient]
    recent_records: list[CareWorkbenchRecord]
    upcoming_tasks: list[CareWorkbenchTask]
