from decimal import Decimal, InvalidOperation

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.patient import Patient
from app.models.user import User
from app.schemas.base import PagedResponse
from app.schemas.care_record import CareMetricIn, CareMetricOut, CareRecordCreate, CareRecordOut, CareRecordUpdate


def ensure_patient_belongs_to_user(db: Session, user: User, patient_id: str) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.id == patient_id, Patient.user_id == user.id))
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="患者不存在。")
    return patient


def get_record_or_404(db: Session, user: User, record_id: str) -> CareRecord:
    record = db.scalar(
        select(CareRecord)
        .join(Patient)
        .where(CareRecord.id == record_id, Patient.user_id == user.id)
        .options(selectinload(CareRecord.metrics))
    )
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="护理记录不存在。")
    return record


def to_decimal(value: object) -> Decimal | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int | float | Decimal):
        return Decimal(str(value))
    if isinstance(value, str) and value.strip():
        try:
            return Decimal(value.strip())
        except InvalidOperation:
            return None
    return None


def create_metric(metric: CareMetricIn) -> CareMetric:
    numeric_value = to_decimal(metric.value)
    return CareMetric(
        metric_key=metric.key,
        value_numeric=numeric_value,
        value_text=None if numeric_value is not None else str(metric.value),
        unit=metric.unit,
    )


def metric_to_out(metric: CareMetric) -> CareMetricOut:
    value: float | str
    if metric.value_numeric is not None:
        value = float(metric.value_numeric)
    else:
        value = metric.value_text or ""
    return CareMetricOut(key=metric.metric_key, value=value, unit=metric.unit)


def to_record_out(record: CareRecord) -> CareRecordOut:
    return CareRecordOut(
        id=record.id,
        patient_id=record.patient_id,
        record_type=record.record_type,
        occurred_at=record.occurred_at,
        notes=record.notes,
        source=record.source,
        metrics=[metric_to_out(metric) for metric in record.metrics],
    )


def record_value_text(record: CareRecord) -> str:
    metric_map = {metric.metric_key: metric_to_out(metric).value for metric in record.metrics}
    if record.record_type == "blood_pressure":
        return f"{metric_map.get('bloodPressureSystolic', '--')}/{metric_map.get('bloodPressureDiastolic', '--')} mmHg"
    if record.record_type == "temperature":
        return f"{metric_map.get('temperature', '--')} °C"
    if record.record_type == "blood_sugar":
        return f"{metric_map.get('bloodSugar', '--')} mmol/L"
    if record.record_type == "heart_rate":
        return f"{metric_map.get('heartRate', '--')} bpm"
    if record.record_type == "medication":
        return " ".join(str(metric_map.get(key, "")) for key in ["medicationName", "medicationDose"]).strip()
    if record.record_type == "diet":
        return str(metric_map.get("dietDescription", record.notes))
    return str(metric_map.get("observationText", record.notes))


def list_records(db: Session, user: User) -> PagedResponse[CareRecordOut]:
    records = db.scalars(
        select(CareRecord)
        .join(Patient)
        .where(Patient.user_id == user.id)
        .options(selectinload(CareRecord.metrics))
        .order_by(CareRecord.occurred_at.desc())
    ).all()
    return PagedResponse(items=[to_record_out(record) for record in records], total=len(records))


def create_record(db: Session, user: User, payload: CareRecordCreate) -> CareRecordOut:
    ensure_patient_belongs_to_user(db, user, payload.patient_id)
    record = CareRecord(
        patient_id=payload.patient_id,
        record_type=payload.record_type,
        occurred_at=payload.occurred_at,
        notes=payload.notes,
        source=payload.source,
    )
    record.metrics = [create_metric(metric) for metric in payload.metrics]
    db.add(record)
    db.commit()
    db.refresh(record)
    db.refresh(record, attribute_names=["metrics"])
    return to_record_out(record)


def update_record(db: Session, user: User, record_id: str, payload: CareRecordUpdate) -> CareRecordOut:
    ensure_patient_belongs_to_user(db, user, payload.patient_id)
    record = get_record_or_404(db, user, record_id)
    record.patient_id = payload.patient_id
    record.record_type = payload.record_type
    record.occurred_at = payload.occurred_at
    record.notes = payload.notes
    record.source = payload.source
    record.metrics.clear()
    record.metrics.extend(create_metric(metric) for metric in payload.metrics)
    db.commit()
    db.refresh(record)
    db.refresh(record, attribute_names=["metrics"])
    return to_record_out(record)
