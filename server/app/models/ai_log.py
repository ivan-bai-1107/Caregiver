from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class AiAssistantLog(Base):
    __tablename__ = "ai_assistant_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("ail"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    draft_type: Mapped[str | None] = mapped_column(String(16), nullable=True)
    draft_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    sources: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    risk_note: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="ai_logs")
