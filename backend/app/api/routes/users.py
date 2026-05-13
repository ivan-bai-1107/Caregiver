from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.user import UserNotificationSettings, UserPreferences, UserProfileUpdate
from app.services.user_service import (
    get_or_create_notification_settings,
    get_or_create_preferences,
    get_user_stats,
    to_notification_settings,
    to_preferences,
    to_user_profile,
    update_notification_settings,
    update_preferences,
    update_user_profile,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def read_me(current_user: Annotated[User, Depends(get_current_user)]) -> dict[str, object]:
    return success_response(to_user_profile(current_user))


@router.put("/me")
def update_me(
    payload: UserProfileUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_user_profile(db, current_user, payload))


@router.get("/me/stats")
def read_my_stats(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_user_stats(db, current_user))


@router.get("/me/notification-settings")
def read_notification_settings(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    settings = get_or_create_notification_settings(db, current_user)
    return success_response(to_notification_settings(settings))


@router.put("/me/notification-settings")
def update_my_notification_settings(
    payload: UserNotificationSettings,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_notification_settings(db, current_user, payload))


@router.get("/me/preferences")
def read_preferences(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    preferences = get_or_create_preferences(db, current_user)
    return success_response(to_preferences(preferences))


@router.put("/me/preferences")
def update_my_preferences(
    payload: UserPreferences,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(update_preferences(db, current_user, payload))
