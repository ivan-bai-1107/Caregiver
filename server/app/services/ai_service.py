import re
from datetime import datetime, time, timedelta, timezone
from typing import Any, Literal

from pydantic import ConfigDict, Field, ValidationError, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.ai_log import AiAssistantLog
from app.models.patient import Patient
from app.models.user import User
from app.models.utils import new_id
from app.schemas.ai import AiAssistantRequest, AiAssistantResponse
from app.schemas.base import CamelModel, to_camel
from app.services.cache_service import invalidate_admin_dashboard_cache
from app.services.deepseek_service import DeepSeekServiceError, call_deepseek_assistant
from app.services.prompt_service import get_active_ai_system_prompt
from app.services.rag_service import knowledge_source_labels, retrieve_knowledge_context

AIIntent = Literal["qa", "care_record", "care_task", "form_prefill"]
DraftType = Literal["record", "task"] | None
RecordType = Literal[
    "blood_pressure",
    "temperature",
    "blood_sugar",
    "heart_rate",
    "medication",
    "diet",
    "other",
]
TaskType = Literal[
    "blood_pressure",
    "blood_sugar",
    "medication",
    "diet",
    "rehab",
    "appointment",
    "nutrition",
    "other",
]
RepeatRule = Literal["once", "daily", "weekly", "monthly"]
Priority = Literal["low", "normal", "high"]


class StrictCamelModel(CamelModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        extra="forbid",
    )


class RecordDraftMetrics(StrictCamelModel):
    blood_pressure_systolic: str = ""
    blood_pressure_diastolic: str = ""
    temperature: str = ""
    blood_sugar: str = ""
    heart_rate: str = ""
    medication_name: str = ""
    medication_dose: str = ""
    diet_description: str = ""
    observation_text: str = ""

    @field_validator("*", mode="before")
    @classmethod
    def normalize_metric_value(cls, value: Any) -> str:
        if value is None:
            return ""
        if isinstance(value, bool):
            raise ValueError("metric value cannot be boolean")
        if isinstance(value, int | float | str):
            return str(value).strip()
        raise ValueError("metric value must be string or number")


class RecordDraftPayload(StrictCamelModel):
    patient_id: str = ""
    patient_name: str | None = None
    record_type: RecordType
    occurred_at: datetime
    notes: str = ""
    metrics: RecordDraftMetrics

    @field_validator("patient_id", "patient_name", "notes", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: Any) -> str:
        if value is None:
            return ""
        if isinstance(value, str):
            return value.strip()
        return str(value).strip()


class TaskDraftPayload(StrictCamelModel):
    patient_id: str = ""
    patient_name: str | None = None
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    task_type: TaskType
    remind_time: datetime
    repeat_rule: RepeatRule
    priority: Priority
    remind_offset_minutes: int = Field(default=15, ge=0)

    @field_validator("patient_id", "patient_name", "title", "description", mode="before")
    @classmethod
    def normalize_optional_text(cls, value: Any) -> str:
        if value is None:
            return ""
        if isinstance(value, str):
            return value.strip()
        return str(value).strip()


class ProviderAiResponse(StrictCamelModel):
    intent: AIIntent
    answer_text: str = Field(min_length=1)
    draft_type: DraftType = None
    draft_payload: dict[str, Any] | None = None
    sources: list[str] = Field(default_factory=list)
    risk_note: str = Field(min_length=1)


def list_user_patients(db: Session, user: User) -> list[Patient]:
    return list(
        db.scalars(
            select(Patient)
            .where(Patient.user_id == user.id)
            .order_by(Patient.created_at.asc())
        ).all()
    )


def patient_prompt_context(patients: list[Patient]) -> list[dict[str, str]]:
    return [{"id": patient.id, "name": patient.name} for patient in patients]


def match_patient_by_name(patients: list[Patient], name: str) -> Patient | None:
    value = name.strip()
    if not value:
        return None

    for patient in patients:
        if patient.name == value:
            return patient

    for patient in patients:
        if patient.name and (patient.name in value or value in patient.name):
            return patient
    return None


def find_patient_in_message(patients: list[Patient], message: str) -> Patient | None:
    for patient in patients:
        if patient.name and patient.name in message:
            return patient
    return None


def resolve_patient_id(patient_id: str | None, patient_name: str | None, patients: list[Patient]) -> str:
    patient = resolve_patient(patient_id, patient_name, patients)
    return patient.id if patient else ""


def resolve_patient(patient_id: str | None, patient_name: str | None, patients: list[Patient]) -> Patient | None:
    if patient_id:
        for patient in patients:
            if patient.id == patient_id:
                return patient

    if patient_name:
        return match_patient_by_name(patients, patient_name)

    return None


def extract_first_number(message: str, default: str = "") -> str:
    match = re.search(r"(\d+(?:\.\d+)?)", message)
    return match.group(1) if match else default


def extract_metric(message: str, label: str, default: str = "") -> str:
    match = re.search(fr"{label}\D*(\d+(?:\.\d+)?)", message)
    return match.group(1) if match else default


def detect_intent(message: str) -> str:
    question_keywords = ["哪些", "什么", "怎么", "如何", "为什么", "注意", "建议", "咨询", "？", "?"]
    action_keywords = ["帮我记录", "记录今天", "记录上午", "记录下午", "收缩压", "舒张压", "创建", "任务", "提醒"]

    if any(keyword in message for keyword in question_keywords) and not any(
        keyword in message for keyword in action_keywords
    ):
        return "qa"
    if any(keyword in message for keyword in ["任务", "提醒", "创建", "每天", "每周", "每月"]):
        return "care_task"
    if any(keyword in message for keyword in ["记录", "血压", "体温", "血糖", "心率", "测量", "用药"]):
        return "care_record"
    return "qa"


def detect_record_type(message: str) -> str:
    if "体温" in message:
        return "temperature"
    if "血糖" in message:
        return "blood_sugar"
    if "心率" in message:
        return "heart_rate"
    if "用药" in message or "服药" in message:
        return "medication"
    if "饮食" in message or "吃" in message:
        return "diet"
    if "血压" in message:
        return "blood_pressure"
    return "other"


def build_record_draft(patients: list[Patient], message: str) -> tuple[str, dict[str, Any], str, str]:
    patient = find_patient_in_message(patients, message)
    record_type = detect_record_type(message)
    metrics = {
        "bloodPressureSystolic": "",
        "bloodPressureDiastolic": "",
        "temperature": "",
        "bloodSugar": "",
        "heartRate": "",
        "medicationName": "",
        "medicationDose": "",
        "dietDescription": "",
        "observationText": "",
    }

    if record_type == "blood_pressure":
        systolic = extract_metric(message, "收缩压")
        diastolic = extract_metric(message, "舒张压")
        if not systolic or not diastolic:
            numbers = re.findall(r"\d+(?:\.\d+)?", message)
            systolic = systolic or (numbers[0] if len(numbers) >= 1 else "")
            diastolic = diastolic or (numbers[1] if len(numbers) >= 2 else "")
        metrics["bloodPressureSystolic"] = systolic
        metrics["bloodPressureDiastolic"] = diastolic
    elif record_type == "temperature":
        metrics["temperature"] = extract_first_number(message)
    elif record_type == "blood_sugar":
        metrics["bloodSugar"] = extract_first_number(message)
    elif record_type == "heart_rate":
        metrics["heartRate"] = extract_first_number(message)
    elif record_type == "medication":
        metrics["medicationName"] = message
    elif record_type == "diet":
        metrics["dietDescription"] = message
    else:
        metrics["observationText"] = message

    draft = {
        "patientId": patient.id if patient else "",
        "patientName": patient.name if patient else "",
        "recordType": record_type,
        "occurredAt": datetime.now(timezone.utc).isoformat(),
        "notes": "AI 根据描述生成的护理记录草稿",
        "metrics": metrics,
    }
    answer = "好的，我已生成护理记录草稿，请确认。"
    risk_note = "请核对以上信息是否准确，确认后再保存。"
    return answer, draft, "record", risk_note


def build_task_draft(patients: list[Patient], message: str) -> tuple[str, dict[str, Any], str, str]:
    patient = find_patient_in_message(patients, message)
    now = datetime.now(timezone.utc)
    hour_match = re.search(r"(\d{1,2})点", message)
    hour = int(hour_match.group(1)) if hour_match else 8
    next_day = now.date() + timedelta(days=1)
    remind_time = datetime.combine(next_day, time(hour=hour), tzinfo=timezone.utc)
    task_type = "blood_pressure" if "血压" in message else "blood_sugar" if "血糖" in message else "other"
    repeat_rule = "daily" if "每天" in message else "weekly" if "每周" in message else "monthly" if "每月" in message else "once"

    draft = {
        "patientId": patient.id if patient else "",
        "patientName": patient.name if patient else "",
        "title": "测量血压" if task_type == "blood_pressure" else "护理任务",
        "description": message,
        "taskType": task_type,
        "remindTime": remind_time.isoformat(),
        "repeatRule": repeat_rule,
        "priority": "normal",
        "remindOffsetMinutes": 15,
    }
    answer = "我已生成护理任务草稿，请确认。"
    risk_note = "请核对任务信息后再确认保存。"
    return answer, draft, "task", risk_note


def build_qa_answer(message: str, knowledge_context: list[dict[str, Any]] | None = None) -> tuple[str, list[str], str]:
    context = knowledge_context or []
    if context:
        snippets = [str(item.get("snippet") or "").strip() for item in context if item.get("snippet")]
        if snippets:
            answer = "根据知识库资料，" + "；".join(snippets[:2])
            if not answer.endswith(("。", "！", "？")):
                answer += "。"
            answer += " 如出现明显异常或症状持续加重，请及时联系专业医护人员。"
            return (
                answer,
                knowledge_source_labels(context),
                "回答已参考知识库内容，但仍需结合患者实际情况核对。",
            )

    if "高血压" in message or "血压" in message:
        return (
            "高血压患者应注意限制钠盐摄入，保持规律作息，并按护理计划记录血压变化。",
            ["护理知识库"],
            "AI 回复仅供参考，不构成医疗诊断。",
        )
    if "糖尿病" in message or "血糖" in message:
        return (
            "糖尿病日常护理可重点关注规律血糖监测、饮食控制、足部护理和遵医嘱用药。",
            ["护理知识库"],
            "AI 回复仅供参考，不构成医疗诊断。",
        )
    return (
        "建议先记录患者当前状态、护理时间和关键指标；如出现明显异常，请及时联系专业医护人员。",
        ["护理知识库"],
        "AI 回复仅供参考，不构成医疗诊断。",
    )


def build_rule_based_response(
    conversation_id: str,
    patients: list[Patient],
    message: str,
    knowledge_context: list[dict[str, Any]] | None = None,
) -> AiAssistantResponse:
    intent = detect_intent(message)
    draft_payload: dict[str, Any] | None = None
    draft_type: str | None = None
    sources: list[str] = []

    if intent == "care_record":
        answer_text, draft_payload, draft_type, risk_note = build_record_draft(patients, message)
    elif intent == "care_task":
        answer_text, draft_payload, draft_type, risk_note = build_task_draft(patients, message)
    else:
        answer_text, sources, risk_note = build_qa_answer(message, knowledge_context)

    return AiAssistantResponse(
        conversation_id=conversation_id,
        intent=intent,
        answer_text=answer_text,
        draft_type=draft_type,
        draft_payload=draft_payload,
        sources=sources,
        risk_note=risk_note,
        generated_by="fallback",
    )


def normalize_record_draft(payload: dict[str, Any], patients: list[Patient]) -> dict[str, Any]:
    draft = RecordDraftPayload.model_validate(payload)
    patient = resolve_patient(draft.patient_id, draft.patient_name, patients)
    normalized = draft.model_dump(
        by_alias=True,
        mode="json",
        exclude={"patient_name"},
    )
    normalized["patientId"] = patient.id if patient else ""
    normalized["patientName"] = patient.name if patient else ""
    return normalized


def normalize_task_draft(payload: dict[str, Any], patients: list[Patient]) -> dict[str, Any]:
    draft = TaskDraftPayload.model_validate(payload)
    patient = resolve_patient(draft.patient_id, draft.patient_name, patients)
    normalized = draft.model_dump(
        by_alias=True,
        mode="json",
        exclude={"patient_name"},
    )
    normalized["patientId"] = patient.id if patient else ""
    normalized["patientName"] = patient.name if patient else ""
    return normalized


def validate_provider_response(
    conversation_id: str,
    raw_response: dict[str, Any],
    patients: list[Patient],
    knowledge_context: list[dict[str, Any]] | None = None,
) -> AiAssistantResponse:
    if not str(raw_response.get("riskNote") or "").strip():
        raw_response = {
            **raw_response,
            "riskNote": "AI 回复仅供护理参考，不构成医疗诊断或治疗建议。",
        }
    if not isinstance(raw_response.get("sources"), list):
        raw_response = {**raw_response, "sources": []}

    provider_response = ProviderAiResponse.model_validate(raw_response)
    draft_payload: dict[str, Any] | None = None

    if provider_response.intent == "care_record" and provider_response.draft_type != "record":
        raise ValueError("care_record intent requires record draftType")
    if provider_response.intent == "care_task" and provider_response.draft_type != "task":
        raise ValueError("care_task intent requires task draftType")
    if provider_response.intent in {"qa", "form_prefill"} and provider_response.draft_type is not None:
        raise ValueError("qa and form_prefill intents must not return a draft")

    if provider_response.draft_type is None:
        if provider_response.draft_payload is not None:
            raise ValueError("draftPayload must be null when draftType is null")
    elif provider_response.draft_type == "record":
        if provider_response.intent != "care_record":
            raise ValueError("record draft requires care_record intent")
        if provider_response.draft_payload is None:
            raise ValueError("record draftPayload is required")
        draft_payload = normalize_record_draft(provider_response.draft_payload, patients)
    elif provider_response.draft_type == "task":
        if provider_response.intent != "care_task":
            raise ValueError("task draft requires care_task intent")
        if provider_response.draft_payload is None:
            raise ValueError("task draftPayload is required")
        draft_payload = normalize_task_draft(provider_response.draft_payload, patients)

    rag_sources = knowledge_source_labels(knowledge_context or [])
    sources = provider_response.sources or rag_sources

    return AiAssistantResponse(
        conversation_id=conversation_id,
        intent=provider_response.intent,
        answer_text=provider_response.answer_text.strip(),
        draft_type=provider_response.draft_type,
        draft_payload=draft_payload,
        sources=sources,
        risk_note=provider_response.risk_note.strip(),
        generated_by="deepseek",
    )


def should_use_deepseek() -> bool:
    settings = get_settings()
    return (
        settings.ai_use_real_model
        and settings.ai_provider.strip().lower() == "deepseek"
        and bool(settings.deepseek_api_key.get_secret_value().strip())
    )


def build_deepseek_response(
    db: Session,
    conversation_id: str,
    patients: list[Patient],
    message: str,
    knowledge_context: list[dict[str, Any]],
) -> AiAssistantResponse:
    settings = get_settings()
    raw_response = call_deepseek_assistant(
        settings=settings,
        message=message,
        patients=patient_prompt_context(patients),
        knowledge_context=knowledge_context,
        system_prompt=get_active_ai_system_prompt(db),
    )
    return validate_provider_response(conversation_id, raw_response, patients, knowledge_context)


def write_ai_log(db: Session, user: User, message: str, response: AiAssistantResponse) -> None:
    db.add(
        AiAssistantLog(
            user_id=user.id,
            message=message,
            intent=response.intent,
            answer_text=response.answer_text,
            draft_type=response.draft_type,
            draft_payload=response.draft_payload,
            sources=response.sources,
            risk_note=response.risk_note,
        )
    )
    db.commit()
    invalidate_admin_dashboard_cache()


def handle_assistant_message(db: Session, user: User, payload: AiAssistantRequest) -> AiAssistantResponse:
    conversation_id = payload.conversation_id or new_id("conv")
    patients = list_user_patients(db, user)
    knowledge_context = retrieve_knowledge_context(db, payload.message)

    if should_use_deepseek():
        try:
            response = build_deepseek_response(db, conversation_id, patients, payload.message, knowledge_context)
        except (DeepSeekServiceError, ValidationError, ValueError, TypeError, KeyError):
            response = build_rule_based_response(conversation_id, patients, payload.message, knowledge_context)
    else:
        response = build_rule_based_response(conversation_id, patients, payload.message, knowledge_context)

    write_ai_log(db, user, payload.message, response)
    return response
