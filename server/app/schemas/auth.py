from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


class SendEmailCodeRequest(CamelModel):
    email: EmailStr


class RegisterRequest(CamelModel):
    username: str = Field(min_length=1, max_length=80)
    email: EmailStr
    code: str = Field(min_length=4, max_length=16)
    password: str = Field(min_length=6, max_length=128)


class ResetPasswordRequest(CamelModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=16)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(CamelModel):
    token: str
    refresh_token: str
