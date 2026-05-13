from app.schemas.base import CamelModel


class HomeSummary(CamelModel):
    pending_task_count: int
    completed_task_count: int
    health_alert_count: int
    task_reminder_count: int


class HomeHealthAlert(CamelModel):
    id: str
    patient_id: str
    patient_name: str
    message: str
    severity: str
    occurred_at: str


class HomeTaskItem(CamelModel):
    id: str
    patient_id: str
    patient_name: str
    title: str
    remind_time: str
    status: str
    priority: str


class RecentPatientCard(CamelModel):
    patient_id: str
    name: str
    age: int
    condition_summary: str
    status: str
    last_activity_at: str | None


class HomeSummaryResponse(CamelModel):
    summary: HomeSummary
    health_alerts: list[HomeHealthAlert]
    task_items: list[HomeTaskItem]
    recent_patients: list[RecentPatientCard]
