from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


class UserProfile(CamelModel):
    id: str
    username: str
    email: EmailStr
    avatar_url: str = ""


class UserProfileUpdate(CamelModel):
    username: str = Field(min_length=1, max_length=80)
    email: EmailStr


class UserAvatarUpdate(CamelModel):
    image_data: str = Field(min_length=1)


class UserStats(CamelModel):
    patient_count: int
    record_count: int
    task_completed_count: int
    task_pending_count: int


class UserNotificationSettings(CamelModel):
    task_reminder_enabled: bool
    health_alert_enabled: bool
    system_notification_enabled: bool


class UserPreferences(CamelModel):
    theme: str = Field(default="system", max_length=32)
    language: str = Field(default="zh-CN", max_length=32)
