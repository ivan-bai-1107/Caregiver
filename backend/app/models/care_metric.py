from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class CareMetric(Base):
    __tablename__ = "care_metrics"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("met"))
    care_record_id: Mapped[str] = mapped_column(
        ForeignKey("care_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_key: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    value_numeric: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    value_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    care_record = relationship("CareRecord", back_populates="metrics")
