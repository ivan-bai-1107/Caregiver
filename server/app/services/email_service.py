from __future__ import annotations

import smtplib
import ssl
from email.header import Header
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import get_settings


class EmailSendError(RuntimeError):
    """Raised when the verification email cannot be sent."""


def build_sender_header(name: str, email: str) -> str:
    return formataddr((str(Header(name, "utf-8")), email))


def build_verification_message(to_email: str, code: str) -> EmailMessage:
    settings = get_settings()
    from_email = settings.email_from.strip() or settings.smtp_username.strip()
    ttl_minutes = max(settings.email_code_ttl_seconds // 60, 1)
    body = (
        f"【Caregiver 护理助手】您的邮箱验证码是：{code}\n\n"
        f"验证码 {ttl_minutes} 分钟内有效，请勿泄露给他人。\n"
        "如果不是您本人操作，请忽略此邮件。"
    )

    message = EmailMessage()
    message["Subject"] = str(Header("Caregiver 护理助手邮箱验证码", "utf-8"))
    message["From"] = build_sender_header(settings.email_from_name, from_email)
    message["To"] = to_email
    message.set_content(body, subtype="plain", charset="utf-8")
    return message


def send_verification_code_email(to_email: str, code: str) -> None:
    settings = get_settings()
    provider = settings.email_provider.strip().lower()

    if provider == "console":
        if settings.email_debug_code:
            print(f"[email] verification code for {to_email}: {code}")
        else:
            print(f"[email] verification email requested for {to_email}")
        return

    if provider != "smtp":
        raise EmailSendError("unsupported email provider")

    username = settings.smtp_username.strip()
    password = settings.smtp_password.get_secret_value().strip()
    from_email = settings.email_from.strip() or username
    if not settings.smtp_host.strip() or not username or not password or not from_email:
        raise EmailSendError("smtp configuration is incomplete")

    message = build_verification_message(to_email, code)
    timeout = max(settings.email_send_timeout_seconds, 1)
    context = ssl.create_default_context()

    try:
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(
                settings.smtp_host,
                settings.smtp_port,
                timeout=timeout,
                context=context,
            ) as server:
                server.login(username, password)
                server.send_message(message)
            return

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=timeout) as server:
            if settings.smtp_use_starttls:
                server.starttls(context=context)
            server.login(username, password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise EmailSendError("verification email send failed") from exc
