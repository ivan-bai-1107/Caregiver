from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("usr"))
    username: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    patients = relationship("Patient", back_populates="user", cascade="all, delete-orphan")
    notification_settings = relationship(
        "UserNotificationSetting",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    preferences = relationship(
        "UserPreference",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    ai_logs = relationship("AiAssistantLog", back_populates="user", cascade="all, delete-orphan")
    knowledge_likes = relationship("UserKnowledgeLike", back_populates="user", cascade="all, delete-orphan")
    knowledge_bookmarks = relationship("UserKnowledgeBookmark", back_populates="user", cascade="all, delete-orphan")


class EmailVerificationCode(Base):
    __tablename__ = "email_verification_codes"
    __table_args__ = (UniqueConstraint("email", "code", "created_at", name="uq_email_code_created_at"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("evc"))
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
