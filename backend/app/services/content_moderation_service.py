from __future__ import annotations

from typing import Any

import httpx

from app.core.config import get_settings


class ContentModerationError(RuntimeError):
    pass


class ContentRejectedError(ValueError):
    pass


LOCAL_BLOCK_KEYWORDS = ("博彩", "赌博", "代开", "发票", "广告推广")


def is_flagged_payload(payload: dict[str, Any]) -> bool:
    code = payload.get("code")
    if code not in (None, 0):
        raise ContentModerationError("内容审核服务暂不可用，请稍后再试。")

    data = payload.get("data")
    if isinstance(data, dict):
        if isinstance(data.get("is_pass"), bool):
            return not data["is_pass"]
        risk_level = str(data.get("risk_level") or "").lower()
        if risk_level in {"medium", "high"}:
            return True
        if risk_level in {"safe", "low"}:
            return False

    raise ContentModerationError("内容审核服务返回异常，请稍后再试。")


def moderate_text_or_raise(text: str) -> None:
    content = text.strip()
    if not content:
        raise ContentRejectedError("内容不能为空。")

    settings = get_settings()
    if not settings.content_moderation_enabled:
        return

    if any(keyword in content for keyword in LOCAL_BLOCK_KEYWORDS):
        raise ContentRejectedError("内容包含敏感信息，请修改后再提交。")

    api_key = settings.content_moderation_api_key.get_secret_value().strip()
    if not api_key:
        return

    url = f"{settings.content_moderation_base_url.rstrip('/')}/{settings.content_moderation_path.lstrip('/')}"
    headers = {
        "Content-Type": "application/json",
    }
    if api_key:
        headers["X-Api-Key"] = api_key
        headers["Authorization"] = f"Bearer {api_key}"
    body = {
        "action": "moderate",
        "text": content,
        "mask": False,
    }

    try:
        with httpx.Client(timeout=float(settings.content_moderation_timeout_seconds)) as client:
            response = client.post(url, json=body, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise ContentModerationError("内容审核服务暂不可用，请稍后再试。") from exc
    except ValueError as exc:
        raise ContentModerationError("内容审核服务返回异常，请稍后再试。") from exc

    if not isinstance(payload, dict):
        raise ContentModerationError("内容审核服务返回异常，请稍后再试。")

    if is_flagged_payload(payload):
        raise ContentRejectedError("内容包含敏感信息，请修改后再提交。")
