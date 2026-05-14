from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class CareTask(Base):
    __tablename__ = "care_tasks"
    __table_args__ = (
        CheckConstraint(
            "task_type in ('blood_pressure', 'blood_sugar', 'medication', 'diet', 'rehab', 'appointment', 'nutrition', 'other')",
            name="ck_care_tasks_task_type",
        ),
        CheckConstraint("repeat_rule in ('once', 'daily', 'weekly', 'monthly')", name="ck_care_tasks_repeat_rule"),
        CheckConstraint("priority in ('low', 'normal', 'high')", name="ck_care_tasks_priority"),
        CheckConstraint("status in ('pending', 'completed', 'scheduled')", name="ck_care_tasks_status"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("tsk"))
    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    task_type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    remind_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    repeat_rule: Mapped[str] = mapped_column(String(16), nullable=False, default="once")
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="normal")
    remind_offset_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    patient = relationship("Patient", back_populates="care_tasks")
