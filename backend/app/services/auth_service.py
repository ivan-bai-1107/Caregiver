from datetime import timedelta
from random import randint

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis import redis_delete, redis_get, redis_setex
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import EmailVerificationCode, User
from app.models.user_settings import UserNotificationSetting, UserPreference
from app.models.utils import utc_now
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

settings = get_settings()


def issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def email_code_cache_key(email: str) -> str:
    return f"email_code:{email.lower()}"


def create_email_code(db: Session, email: str) -> str:
    code = f"{randint(100000, 999999)}"
    verification_code = EmailVerificationCode(
        email=email,
        code=code,
        expires_at=utc_now() + timedelta(seconds=settings.email_code_ttl_seconds),
    )
    db.add(verification_code)
    db.commit()
    redis_setex(email_code_cache_key(email), settings.email_code_ttl_seconds, code)
    return code


def get_valid_db_email_code(db: Session, email: str, code: str) -> EmailVerificationCode | None:
    return db.scalar(
        select(EmailVerificationCode)
        .where(
            EmailVerificationCode.email == email,
            EmailVerificationCode.code == code,
            EmailVerificationCode.used_at.is_(None),
            EmailVerificationCode.expires_at > utc_now(),
        )
        .order_by(EmailVerificationCode.created_at.desc())
    )


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该邮箱已注册。")

    cached_code = redis_get(email_code_cache_key(payload.email))
    if cached_code is not None and cached_code != payload.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码无效或已过期。")

    verification_code = get_valid_db_email_code(db, payload.email, payload.code)
    if verification_code is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码无效或已过期。")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(UserNotificationSetting(user_id=user.id))
    db.add(UserPreference(user_id=user.id))
    verification_code.used_at = utc_now()
    db.commit()
    redis_delete(email_code_cache_key(payload.email))
    db.refresh(user)
    return issue_tokens(user)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码不正确。")

    return issue_tokens(user)
