from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import success_response
from app.schemas.auth import LoginRequest, RegisterRequest, SendEmailCodeRequest
from app.services.auth_service import create_email_code, login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/email/send-code")
def send_email_code(
    payload: SendEmailCodeRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    code = create_email_code(db, payload.email)
    return success_response(data={"debugCode": code}, message="验证码已生成。")


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
) -> dict[str, object]:
    return success_response(login_user(db, payload))


@router.post("/logout")
def logout() -> dict[str, object]:
    return success_response(message="已退出登录。")
