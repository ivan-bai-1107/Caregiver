from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.models.user_settings import UserNotificationSetting, UserPreference


def get_or_create_user(db) -> User:
    user = db.scalar(select(User).where(User.email == "caregiver@example.com"))
    if user is not None:
        return user

    user = User(
        username="示例照顾者",
        email="caregiver@example.com",
        password_hash=hash_password("password123"),
    )
    db.add(user)
    db.flush()
    db.add(UserNotificationSetting(user_id=user.id))
    db.add(UserPreference(user_id=user.id))
    return user


def get_or_create_patient(db, user: User, name: str, age: int, gender: str, note: str) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.user_id == user.id, Patient.name == name))
    if patient is not None:
        return patient

    patient = Patient(user_id=user.id, name=name, age=age, gender=gender, profile_note=note)
    db.add(patient)
    db.flush()
    return patient


def add_record_if_empty(db, patient: Patient) -> None:
    existing_record = db.scalar(select(CareRecord).where(CareRecord.patient_id == patient.id))
    if existing_record is not None:
        return

    now = datetime.now(timezone.utc)
    samples = [
        (now - timedelta(days=5), 128, 82),
        (now - timedelta(days=3), 132, 84),
        (now - timedelta(days=1), 130, 85),
    ]
    for occurred_at, systolic, diastolic in samples:
        record = CareRecord(
            patient_id=patient.id,
            record_type="blood_pressure",
            occurred_at=occurred_at,
            notes="种子数据：晨间血压记录",
            source="manual",
        )
        record.metrics = [
            CareMetric(metric_key="bloodPressureSystolic", value_numeric=systolic, unit="mmHg"),
            CareMetric(metric_key="bloodPressureDiastolic", value_numeric=diastolic, unit="mmHg"),
        ]
        db.add(record)


def add_task_if_empty(db, patient: Patient) -> None:
    existing_task = db.scalar(select(CareTask).where(CareTask.patient_id == patient.id))
    if existing_task is not None:
        return

    remind_time = datetime.now(timezone.utc) + timedelta(hours=12)
    db.add(
        CareTask(
            patient_id=patient.id,
            title="测量血压",
            description="每天早上为患者测量并记录血压。",
            task_type="blood_pressure",
            remind_time=remind_time,
            repeat_rule="daily",
            priority="normal",
            remind_offset_minutes=15,
            status="pending",
        )
    )


def main() -> None:
    with SessionLocal() as db:
        user = get_or_create_user(db)
        zhang_ming = get_or_create_patient(
            db,
            user,
            name="张明",
            age=68,
            gender="男",
            note="高血压长期管理，需每日记录血压并观察头晕、乏力等状态。",
        )
        get_or_create_patient(
            db,
            user,
            name="李芳",
            age=72,
            gender="女",
            note="术后康复期，重点关注饮食、活动量和夜间休息。",
        )
        add_record_if_empty(db, zhang_ming)
        add_task_if_empty(db, zhang_ming)
        db.commit()
        print("Seed completed.")
        print("Login email: caregiver@example.com")
        print("Password: password123")


if __name__ == "__main__":
    main()
