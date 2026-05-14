from datetime import timedelta
from random import randint

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis import redis_delete, redis_expire, redis_get, redis_incr, redis_setex, redis_ttl
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import EmailVerificationCode, User
from app.models.user_settings import UserNotificationSetting, UserPreference
from app.models.utils import utc_now
from app.schemas.auth import LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse
from app.services.cache_service import invalidate_admin_dashboard_cache

settings = get_settings()

EMAIL_CODE_COOLDOWN_SECONDS = 60
EMAIL_CODE_LOCK_SECONDS = 600
EMAIL_CODE_MAX_FAILURES = 5
LOGIN_LOCK_SECONDS = 600
LOGIN_MAX_FAILURES = 5
RATE_LIMIT_WINDOW_SECONDS = 60
SEND_CODE_IP_MAX_PER_MINUTE = 10
LOGIN_IP_MAX_PER_MINUTE = 20


def issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


def email_code_cache_key(email: str) -> str:
    return f"email_code:{email.lower()}"


def email_code_cooldown_key(email: str) -> str:
    return f"email_code_cooldown:{email.lower()}"


def email_code_fail_key(email: str) -> str:
    return f"email_code_fail:{email.lower()}"


def email_code_lock_key(email: str) -> str:
    return f"email_code_lock:{email.lower()}"


def login_fail_key(email: str) -> str:
    return f"login_fail:{email.lower()}"


def login_lock_key(email: str) -> str:
    return f"login_lock:{email.lower()}"


def send_code_ip_rate_key(ip: str) -> str:
    return f"rate:send_code:ip:{ip}"


def login_ip_rate_key(ip: str) -> str:
    return f"rate:login:ip:{ip}"


def increment_window_counter(key: str, seconds: int) -> int | None:
    count = redis_incr(key)
    if count == 1:
        redis_expire(key, seconds)
    return count


def ensure_send_code_allowed(email: str, ip: str) -> None:
    cooldown_ttl = redis_ttl(email_code_cooldown_key(email))
    if cooldown_ttl is not None and cooldown_ttl > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="验证码发送过于频繁，请稍后再试。",
        )

    count = increment_window_counter(send_code_ip_rate_key(ip), RATE_LIMIT_WINDOW_SECONDS)
    if count is not None and count > SEND_CODE_IP_MAX_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="验证码发送过于频繁，请稍后再试。",
        )


def mark_send_code_cooldown(email: str) -> None:
    redis_setex(email_code_cooldown_key(email), EMAIL_CODE_COOLDOWN_SECONDS, "1")


def ensure_login_request_allowed(ip: str) -> None:
    count = increment_window_counter(login_ip_rate_key(ip), RATE_LIMIT_WINDOW_SECONDS)
    if count is not None and count > LOGIN_IP_MAX_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录请求过于频繁，请稍后再试。",
        )


def record_email_code_failure(email: str) -> None:
    count = increment_window_counter(email_code_fail_key(email), EMAIL_CODE_LOCK_SECONDS)
    if count is not None and count >= EMAIL_CODE_MAX_FAILURES:
        redis_setex(email_code_lock_key(email), EMAIL_CODE_LOCK_SECONDS, "1")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="验证码错误次数过多，请稍后再试。",
        )


def ensure_email_code_not_locked(email: str) -> None:
    if redis_get(email_code_lock_key(email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="验证码错误次数过多，请稍后再试。",
        )


def clear_email_code_limits(email: str) -> None:
    redis_delete(email_code_fail_key(email))
    redis_delete(email_code_lock_key(email))
    redis_delete(email_code_cooldown_key(email))


def record_login_failure(email: str) -> None:
    count = increment_window_counter(login_fail_key(email), LOGIN_LOCK_SECONDS)
    if count is not None and count >= LOGIN_MAX_FAILURES:
        redis_setex(login_lock_key(email), LOGIN_LOCK_SECONDS, "1")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录失败次数过多，请稍后再试。",
        )


def ensure_login_not_locked(email: str) -> None:
    if redis_get(login_lock_key(email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录失败次数过多，请稍后再试。",
        )


def clear_login_failures(email: str) -> None:
    redis_delete(login_fail_key(email))
    redis_delete(login_lock_key(email))


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


def verify_email_code_or_raise(db: Session, email: str, code: str) -> EmailVerificationCode:
    ensure_email_code_not_locked(email)

    cached_code = redis_get(email_code_cache_key(email))
    if cached_code is not None and cached_code != code:
        record_email_code_failure(email)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码无效或已过期。")

    verification_code = get_valid_db_email_code(db, email, code)
    if verification_code is None:
        record_email_code_failure(email)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码无效或已过期。")

    return verification_code


def register_user(db: Session, payload: RegisterRequest) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该邮箱已注册。")

    verification_code = verify_email_code_or_raise(db, payload.email, payload.code)

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
    clear_email_code_limits(payload.email)
    invalidate_admin_dashboard_cache()
    db.refresh(user)
    return issue_tokens(user)


def reset_user_password(db: Session, payload: ResetPasswordRequest) -> None:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="该邮箱尚未注册。")

    verification_code = verify_email_code_or_raise(db, payload.email, payload.code)
    user.password_hash = hash_password(payload.password)
    verification_code.used_at = utc_now()
    db.commit()
    redis_delete(email_code_cache_key(payload.email))
    clear_email_code_limits(payload.email)
    clear_login_failures(payload.email)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    ensure_login_not_locked(payload.email)

    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码不正确。")

    if not verify_password(payload.password, user.password_hash):
        record_login_failure(payload.email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码不正确。")

    clear_login_failures(payload.email)
    return issue_tokens(user)
