from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.patient import Patient
from app.models.user import User
from app.models.user_settings import UserNotificationSetting, UserPreference
from app.schemas.user import (
    UserNotificationSettings,
    UserPreferences,
    UserProfile,
    UserProfileUpdate,
    UserStats,
)


def to_user_profile(user: User) -> UserProfile:
    return UserProfile(id=user.id, username=user.username, email=user.email)


def update_user_profile(db: Session, user: User, payload: UserProfileUpdate) -> UserProfile:
    existing_user = db.scalar(select(User).where(User.email == payload.email, User.id != user.id))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该邮箱已被其他用户使用。")

    user.username = payload.username
    user.email = payload.email
    db.commit()
    db.refresh(user)
    return to_user_profile(user)


def get_user_stats(db: Session, user: User) -> UserStats:
    patient_count = db.scalar(select(func.count(Patient.id)).where(Patient.user_id == user.id)) or 0
    record_count = (
        db.scalar(
            select(func.count(CareRecord.id))
            .join(Patient)
            .where(Patient.user_id == user.id)
        )
        or 0
    )
    task_completed_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(Patient.user_id == user.id, CareTask.status == "completed")
        )
        or 0
    )
    task_pending_count = (
        db.scalar(
            select(func.count(CareTask.id))
            .join(Patient)
            .where(Patient.user_id == user.id, CareTask.status != "completed")
        )
        or 0
    )
    return UserStats(
        patient_count=patient_count,
        record_count=record_count,
        task_completed_count=task_completed_count,
        task_pending_count=task_pending_count,
    )


def get_or_create_notification_settings(db: Session, user: User) -> UserNotificationSetting:
    settings = db.scalar(
        select(UserNotificationSetting).where(UserNotificationSetting.user_id == user.id)
    )
    if settings is None:
        settings = UserNotificationSetting(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def get_or_create_preferences(db: Session, user: User) -> UserPreference:
    preferences = db.scalar(select(UserPreference).where(UserPreference.user_id == user.id))
    if preferences is None:
        preferences = UserPreference(user_id=user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    return preferences


def to_notification_settings(settings: UserNotificationSetting) -> UserNotificationSettings:
    return UserNotificationSettings(
        task_reminder_enabled=settings.task_reminder_enabled,
        health_alert_enabled=settings.health_alert_enabled,
        system_notification_enabled=settings.system_notification_enabled,
    )


def to_preferences(preferences: UserPreference) -> UserPreferences:
    return UserPreferences(theme=preferences.theme, language=preferences.language)


def update_notification_settings(
    db: Session,
    user: User,
    payload: UserNotificationSettings,
) -> UserNotificationSettings:
    settings = get_or_create_notification_settings(db, user)
    settings.task_reminder_enabled = payload.task_reminder_enabled
    settings.health_alert_enabled = payload.health_alert_enabled
    settings.system_notification_enabled = payload.system_notification_enabled
    db.commit()
    db.refresh(settings)
    return to_notification_settings(settings)


def update_preferences(db: Session, user: User, payload: UserPreferences) -> UserPreferences:
    preferences = get_or_create_preferences(db, user)
    preferences.theme = payload.theme
    preferences.language = payload.language
    db.commit()
    db.refresh(preferences)
    return to_preferences(preferences)
