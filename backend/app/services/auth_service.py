from datetime import timedelta
from random import randint

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import EmailVerificationCode, User
from app.models.user_settings import UserNotificationSetting, UserPreference
from app.models.utils import utc_now
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


def issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def create_email_code(db: Session, email: str) -> str:
    code = f"{randint(100000, 999999)}"
    verification_code = EmailVerificationCode(
        email=email,
        code=code,
        expires_at=utc_now() + timedelta(minutes=10),
    )
    db.add(verification_code)
    db.commit()
    return code


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该邮箱已注册。")

    verification_code = db.scalar(
        select(EmailVerificationCode)
        .where(
            EmailVerificationCode.email == payload.email,
            EmailVerificationCode.code == payload.code,
            EmailVerificationCode.used_at.is_(None),
            EmailVerificationCode.expires_at > utc_now(),
        )
        .order_by(EmailVerificationCode.created_at.desc())
    )
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
    db.refresh(user)
    return issue_tokens(user)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码不正确。")

    return issue_tokens(user)
