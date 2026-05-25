from typing import Any, Literal

from app.schemas.base import CamelModel

AIIntent = Literal["qa", "care_record", "care_task", "care_patient", "form_prefill"]
AIDraftType = Literal["record", "task", "patient"] | None


class AiAssistantRequest(CamelModel):
    message: str
    conversation_id: str | None = None


class AiAssistantResponse(CamelModel):
    conversation_id: str
    intent: AIIntent
    answer_text: str
    draft_type: AIDraftType
    draft_payload: dict[str, Any] | None
    sources: list[str]
    risk_note: str
    generated_by: str = "fallback"


class AiHistoryMessage(CamelModel):
    id: str
    role: Literal["user", "ai"]
    content: str
    timestamp: str
    intent: AIIntent | None = None
    draft_type: AIDraftType = None
    draft_payload: dict[str, Any] | None = None
    sources: list[str] = []
    risk_note: str | None = None
    generated_by: str | None = None


class AiConversationSummary(CamelModel):
    conversation_id: str
    title: str
    last_message: str
    message_count: int
    updated_at: str


class AiConversationDetail(CamelModel):
    conversation_id: str
    title: str
    messages: list[AiHistoryMessage]
