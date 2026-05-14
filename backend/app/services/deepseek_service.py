from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import Settings


SYSTEM_PROMPT = """你是医疗照顾者系统中的护理辅助 AI。
你只帮助照顾者整理护理记录草稿、护理任务草稿、回答一般护理问题。
你不能做医疗诊断，不能替代医生。
所有结构化结果必须经过用户确认后才能保存。
你必须返回严格 JSON，不要返回 markdown，不要返回解释性前缀。

输出 JSON 必须符合：
{
  "intent": "qa | care_record | care_task | form_prefill",
  "answerText": "string",
  "draftType": "record | task | null",
  "draftPayload": {},
  "sources": [],
  "riskNote": "string"
}

当 draftType 为 null 时，draftPayload 必须为 null。
当生成护理记录草稿时，血压必须拆成 bloodPressureSystolic 和 bloodPressureDiastolic。
当无法匹配患者时，patientId 返回空字符串；可以同时返回 patientName 供后端匹配。
"""


class DeepSeekServiceError(RuntimeError):
    pass


def build_user_prompt(message: str, patients: list[dict[str, str]]) -> str:
    patient_context = json.dumps(patients, ensure_ascii=False)
    return f"""用户输入：
{message}

当前用户患者列表：
{patient_context}

约束：
- patientId 只能使用上方患者列表里的 id。
- 如果用户只提到患者姓名，可返回 patientName，后端会再次匹配 patientId。
- 如果无法确定患者，patientId 必须为空字符串。
- recordType 只能是 blood_pressure、temperature、blood_sugar、heart_rate、medication、diet、other。
- record draft 的 metrics 必须包含 bloodPressureSystolic、bloodPressureDiastolic、temperature、bloodSugar、heartRate、medicationName、medicationDose、dietDescription、observationText。
- taskType 只能是 blood_pressure、blood_sugar、medication、diet、rehab、appointment、nutrition、other。
- repeatRule 只能是 once、daily、weekly、monthly。
- priority 只能是 low、normal、high。
- 当前 UTC 时间是 {datetime.now(timezone.utc).isoformat()}。
"""


def parse_response_content(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise DeepSeekServiceError("DeepSeek response shape is invalid") from exc

    if not isinstance(content, str) or not content.strip():
        raise DeepSeekServiceError("DeepSeek response content is empty")

    try:
        parsed = json.loads(content.strip())
    except json.JSONDecodeError as exc:
        raise DeepSeekServiceError("DeepSeek response content is not strict JSON") from exc

    if not isinstance(parsed, dict):
        raise DeepSeekServiceError("DeepSeek response JSON must be an object")
    return parsed


def call_deepseek_assistant(
    settings: Settings,
    message: str,
    patients: list[dict[str, str]],
    system_prompt: str | None = None,
) -> dict[str, Any]:
    api_key = settings.deepseek_api_key.get_secret_value().strip()
    if not api_key:
        raise DeepSeekServiceError("DeepSeek API key is not configured")

    url = f"{settings.deepseek_base_url.rstrip('/')}/chat/completions"
    request_payload = {
        "model": settings.deepseek_model,
        "messages": [
            {"role": "system", "content": system_prompt or SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(message, patients)},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=request_payload, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError as exc:
        raise DeepSeekServiceError("DeepSeek request failed") from exc
    except ValueError as exc:
        raise DeepSeekServiceError("DeepSeek HTTP response is not JSON") from exc

    if not isinstance(payload, dict):
        raise DeepSeekServiceError("DeepSeek HTTP response must be a JSON object")
    return parse_response_content(payload)
