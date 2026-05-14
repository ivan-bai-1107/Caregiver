from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.responses import success_response
from app.schemas.auth import LoginRequest, RegisterRequest, ResetPasswordRequest, SendEmailCodeRequest
from app.services.auth_service import (
    create_email_code,
    ensure_login_request_allowed,
    ensure_send_code_allowed,
    login_user,
    mark_send_code_cooldown,
    register_user,
    reset_user_password,
)
from app.services.email_service import EmailSendError, send_verification_code_email

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or "unknown"
    return request.client.host if request.client else "unknown"


@router.post("/email/send-code")
def send_email_code(
    payload: SendEmailCodeRequest,
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> dict[str, object]:
    ensure_send_code_allowed(payload.email, client_ip(request))
    code = create_email_code(db, payload.email)
    mark_send_code_cooldown(payload.email)

    try:
        send_verification_code_email(payload.email, code)
    except EmailSendError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="验证码发送失败，请稍后重试。",
        ) from exc

    provider = settings.email_provider.strip().lower()
    message = "验证码已发送，请查收邮箱。" if provider == "smtp" and not settings.email_debug_code else "验证码已发送。"
    response: dict[str, object] = {"success": True, "message": message}
    if settings.email_debug_code:
        response["debugCode"] = code
    return response


@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    return success_response(register_user(db, payload))


@router.post("/login")
def login(
    payload: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
    request: Request,
) -> dict[str, object]:
    ensure_login_request_allowed(client_ip(request))
    return success_response(login_user(db, payload))


@router.post("/password/reset")
def reset_password(
    payload: ResetPasswordRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    reset_user_password(db, payload)
    return success_response(message="密码已重置，请使用新密码登录。")


@router.post("/logout")
def logout() -> dict[str, object]:
    return success_response(message="已退出登录。")
