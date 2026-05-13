from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class CareRecord(Base):
    __tablename__ = "care_records"
    __table_args__ = (
        CheckConstraint(
            "record_type in ('blood_pressure', 'temperature', 'blood_sugar', 'heart_rate', 'medication', 'diet', 'other')",
            name="ck_care_records_record_type",
        ),
        CheckConstraint("source in ('manual', 'ai')", name="ck_care_records_source"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("rec"))
    patient_id: Mapped[str] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    record_type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    source: Mapped[str] = mapped_column(String(16), nullable=False, default="manual")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    patient = relationship("Patient", back_populates="care_records")
    metrics = relationship("CareMetric", back_populates="care_record", cascade="all, delete-orphan")
