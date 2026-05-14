from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class UserNotificationSetting(Base):
    __tablename__ = "user_notification_settings"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_notification_settings_user_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("uns"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_reminder_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    health_alert_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    system_notification_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    user = relationship("User", back_populates="notification_settings")


class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_preferences_user_id"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("upr"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    theme: Mapped[str] = mapped_column(String(32), nullable=False, default="system")
    language: Mapped[str] = mapped_column(String(32), nullable=False, default="zh-CN")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    user = relationship("User", back_populates="preferences")
