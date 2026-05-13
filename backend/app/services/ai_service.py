import re
from datetime import datetime, time, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_log import AiAssistantLog
from app.models.patient import Patient
from app.models.user import User
from app.models.utils import new_id
from app.schemas.ai import AiAssistantRequest, AiAssistantResponse


def find_patient(db: Session, user: User, message: str) -> Patient | None:
    patients = db.scalars(select(Patient).where(Patient.user_id == user.id).order_by(Patient.created_at.asc())).all()
    for patient in patients:
        if patient.name and patient.name in message:
            return patient
    return patients[0] if patients else None


def extract_first_number(message: str, default: str = "") -> str:
    match = re.search(r"(\d+(?:\.\d+)?)", message)
    return match.group(1) if match else default


def extract_metric(message: str, label: str, default: str = "") -> str:
    match = re.search(fr"{label}\D*(\d+(?:\.\d+)?)", message)
    return match.group(1) if match else default


def detect_intent(message: str) -> str:
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


def build_record_draft(db: Session, user: User, message: str) -> tuple[str, dict[str, Any], str, str]:
    patient = find_patient(db, user, message)
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
        "recordType": record_type,
        "occurredAt": datetime.now(timezone.utc).isoformat(),
        "notes": "AI 根据描述生成的护理记录草稿",
        "metrics": metrics,
    }
    answer = "好的，我已生成护理记录草稿，请确认。"
    risk_note = "请核对以上信息是否准确，确认后再保存。"
    return answer, draft, "record", risk_note


def build_task_draft(db: Session, user: User, message: str) -> tuple[str, dict[str, Any], str, str]:
    patient = find_patient(db, user, message)
    now = datetime.now(timezone.utc)
    hour_match = re.search(r"(\d{1,2})点", message)
    hour = int(hour_match.group(1)) if hour_match else 8
    next_day = now.date() + timedelta(days=1)
    remind_time = datetime.combine(next_day, time(hour=hour), tzinfo=timezone.utc)
    task_type = "blood_pressure" if "血压" in message else "blood_sugar" if "血糖" in message else "other"
    repeat_rule = "daily" if "每天" in message else "weekly" if "每周" in message else "monthly" if "每月" in message else "once"

    draft = {
        "patientId": patient.id if patient else "",
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


def build_qa_answer(message: str) -> tuple[str, list[str], str]:
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


def handle_assistant_message(db: Session, user: User, payload: AiAssistantRequest) -> AiAssistantResponse:
    conversation_id = payload.conversation_id or new_id("conv")
    intent = detect_intent(payload.message)
    draft_payload: dict[str, Any] | None = None
    draft_type: str | None = None
    sources: list[str] = []

    if intent == "care_record":
        answer_text, draft_payload, draft_type, risk_note = build_record_draft(db, user, payload.message)
    elif intent == "care_task":
        answer_text, draft_payload, draft_type, risk_note = build_task_draft(db, user, payload.message)
    else:
        answer_text, sources, risk_note = build_qa_answer(payload.message)

    response = AiAssistantResponse(
        conversation_id=conversation_id,
        intent=intent,
        answer_text=answer_text,
        draft_type=draft_type,
        draft_payload=draft_payload,
        sources=sources,
        risk_note=risk_note,
    )
    db.add(
        AiAssistantLog(
            user_id=user.id,
            message=payload.message,
            intent=intent,
            answer_text=answer_text,
            draft_type=draft_type,
            draft_payload=draft_payload,
            sources=sources,
            risk_note=risk_note,
        )
    )
    db.commit()
    return response
