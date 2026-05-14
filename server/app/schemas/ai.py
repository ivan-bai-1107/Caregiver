from typing import Any, Literal

from app.schemas.base import CamelModel

AIIntent = Literal["qa", "care_record", "care_task", "form_prefill"]
AIDraftType = Literal["record", "task"] | None


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
