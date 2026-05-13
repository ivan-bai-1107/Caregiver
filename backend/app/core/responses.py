from typing import Any

from pydantic import BaseModel


def serialize_payload(value: Any) -> Any:
    if isinstance(value, BaseModel):
        return value.model_dump(by_alias=True, mode="json")
    if isinstance(value, list):
        return [serialize_payload(item) for item in value]
    if isinstance(value, tuple):
        return [serialize_payload(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_payload(item) for key, item in value.items()}
    return value


def success_response(data: Any = None, message: str | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"success": True}
    if data is not None:
        payload["data"] = serialize_payload(data)
    if message is not None:
        payload["message"] = message
    return payload
