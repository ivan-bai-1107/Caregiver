from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.admin import PromptTemplate
from app.schemas.admin import AdminPromptTemplateOut, AdminPromptTemplateUpdate
from app.services.deepseek_service import SYSTEM_PROMPT

AI_ASSISTANT_SYSTEM_PROMPT_KEY = "ai_assistant_system"
AI_ASSISTANT_QA_PROMPT_KEY = "ai_assistant_qa"
AI_ASSISTANT_PATIENT_PROMPT_KEY = "ai_assistant_patient_draft"
AI_ASSISTANT_RECORD_PROMPT_KEY = "ai_assistant_record_draft"
AI_ASSISTANT_TASK_PROMPT_KEY = "ai_assistant_task_draft"
AI_RAG_POLICY_PROMPT_KEY = "ai_rag_policy"
AI_TREND_ANALYSIS_PROMPT_KEY = "ai_trend_analysis"

TREND_ANALYSIS_SYSTEM_PROMPT = """你是医疗照顾者系统里的护理趋势分析助手。
你只能基于给定的结构化趋势数据做护理观察总结，不能做医疗诊断，不能替代医生。
必须返回严格 JSON，不要返回 markdown，不要返回解释性前缀。

输出 JSON 必须符合：
{
  "summary": "string",
  "riskLevel": "stable | attention | high",
  "highlights": ["string"],
  "suggestions": ["string"],
  "riskNote": "string"
}

要求：
- summary 用 1 句话概括趋势。
- highlights 返回 2 到 4 条，描述数据变化和需要关注的点。
- suggestions 返回 2 到 4 条，必须是护理记录、观察、复诊沟通层面的建议。
- riskNote 必须说明 AI 分析仅供护理参考，不构成诊断。
"""

DEFAULT_PROMPT_TEMPLATES = [
    {
        "key": AI_ASSISTANT_SYSTEM_PROMPT_KEY,
        "name": "AI 助手系统 Prompt",
        "description": "控制前台 AI 助手的身份、安全边界、RAG 使用和结构化 JSON 输出规则。",
        "content": SYSTEM_PROMPT,
    },
    {
        "key": AI_ASSISTANT_QA_PROMPT_KEY,
        "name": "护理问答 Prompt",
        "description": "用于 AI 助手回答护理问题时的表达边界和知识库引用要求。",
        "content": "回答护理问题时，优先引用知识库片段，给出可执行的照护观察和记录建议；知识不足时说明需要咨询专业医护人员，不要编造诊断结论。",
    },
    {
        "key": AI_ASSISTANT_PATIENT_PROMPT_KEY,
        "name": "患者信息草稿 Prompt",
        "description": "用于 AI 助手生成患者信息草稿，约束患者姓名、年龄、性别和护理说明。",
        "content": "生成患者信息草稿时，只能把用户明确提供的信息写入 draftPayload。intent 必须为 care_patient，draftType 必须为 patient；draftPayload 必须包含 name、age、gender、profileNote。gender 只能是 男、女、其他；无法确认的字段留空或使用 0。",
    },
    {
        "key": AI_ASSISTANT_RECORD_PROMPT_KEY,
        "name": "护理记录草稿 Prompt",
        "description": "用于 AI 助手生成护理记录草稿，约束患者匹配、记录类型和指标字段。",
        "content": "生成护理记录草稿时，只能把用户明确提供的信息写入 draftPayload。血压必须拆分为 bloodPressureSystolic 和 bloodPressureDiastolic；无法确认患者时 patientId 留空并返回 patientName。",
    },
    {
        "key": AI_ASSISTANT_TASK_PROMPT_KEY,
        "name": "护理任务草稿 Prompt",
        "description": "用于 AI 助手生成护理任务草稿，约束提醒时间、重复规则和任务类型。",
        "content": "生成护理任务草稿时，标题要简短明确，remindTime 使用 ISO 时间；repeatRule 只能是 once、daily、weekly、monthly；无法确认患者时 patientId 留空。",
    },
    {
        "key": AI_RAG_POLICY_PROMPT_KEY,
        "name": "RAG 知识库引用策略",
        "description": "用于约束 AI 如何使用护理知识库片段和 sources 字段。",
        "content": "知识库片段是优先参考材料，但不得超出片段做确定性医疗判断。sources 只返回实际参考过的知识文章标题；没有参考文章时返回空数组。",
    },
    {
        "key": AI_TREND_ANALYSIS_PROMPT_KEY,
        "name": "健康趋势分析 Prompt",
        "description": "用于患者健康趋势分析接口，控制趋势总结、风险等级和护理建议输出。",
        "content": TREND_ANALYSIS_SYSTEM_PROMPT,
    },
]


def ensure_default_prompt_templates(db: Session) -> dict[str, PromptTemplate]:
    existing = {
        prompt.key: prompt
        for prompt in db.scalars(select(PromptTemplate)).all()
    }
    created = False

    for template in DEFAULT_PROMPT_TEMPLATES:
        if template["key"] in existing:
            continue
        prompt = PromptTemplate(
            key=template["key"],
            name=template["name"],
            description=template["description"],
            content=template["content"],
            status="active",
            is_system=True,
        )
        db.add(prompt)
        existing[prompt.key] = prompt
        created = True

    if created:
        db.commit()
        for prompt in existing.values():
            db.refresh(prompt)

    return existing


def to_prompt_out(prompt: PromptTemplate) -> AdminPromptTemplateOut:
    return AdminPromptTemplateOut(
        id=prompt.id,
        key=prompt.key,
        name=prompt.name,
        description=prompt.description,
        content=prompt.content,
        status=prompt.status,
        is_system=prompt.is_system,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


def list_prompt_templates(db: Session) -> list[AdminPromptTemplateOut]:
    ensure_default_prompt_templates(db)
    prompts = db.scalars(select(PromptTemplate).order_by(PromptTemplate.created_at.asc(), PromptTemplate.key.asc())).all()
    return [to_prompt_out(prompt) for prompt in prompts]


def update_prompt_template(db: Session, prompt_id: str, payload: AdminPromptTemplateUpdate) -> AdminPromptTemplateOut:
    ensure_default_prompt_templates(db)
    prompt = db.get(PromptTemplate, prompt_id)
    if prompt is None:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt 模板不存在。")

    prompt.name = payload.name
    prompt.description = payload.description
    prompt.content = payload.content
    prompt.status = payload.status
    db.commit()
    db.refresh(prompt)
    return to_prompt_out(prompt)


def get_active_prompt_content(db: Session, key: str, fallback: str) -> str:
    prompts = ensure_default_prompt_templates(db)
    prompt = prompts.get(key)
    if prompt is None or prompt.status != "active" or not prompt.content.strip():
        return fallback
    return prompt.content


def get_active_ai_system_prompt(db: Session) -> str:
    return get_active_prompt_content(db, AI_ASSISTANT_SYSTEM_PROMPT_KEY, SYSTEM_PROMPT)


def get_active_ai_intent_prompt(db: Session, intent: Literal["qa", "care_record", "care_task", "care_patient"]) -> str:
    if intent == "care_patient":
        return get_active_prompt_content(
            db,
            AI_ASSISTANT_PATIENT_PROMPT_KEY,
            DEFAULT_PROMPT_TEMPLATES[2]["content"],
        )
    if intent == "care_record":
        return get_active_prompt_content(
            db,
            AI_ASSISTANT_RECORD_PROMPT_KEY,
            DEFAULT_PROMPT_TEMPLATES[3]["content"],
        )
    if intent == "care_task":
        return get_active_prompt_content(
            db,
            AI_ASSISTANT_TASK_PROMPT_KEY,
            DEFAULT_PROMPT_TEMPLATES[4]["content"],
        )
    return get_active_prompt_content(
        db,
        AI_ASSISTANT_QA_PROMPT_KEY,
        DEFAULT_PROMPT_TEMPLATES[1]["content"],
    )


def get_active_rag_policy_prompt(db: Session) -> str:
    return get_active_prompt_content(
        db,
        AI_RAG_POLICY_PROMPT_KEY,
        DEFAULT_PROMPT_TEMPLATES[5]["content"],
    )


def get_active_trend_analysis_prompt(db: Session) -> str:
    return get_active_prompt_content(db, AI_TREND_ANALYSIS_PROMPT_KEY, TREND_ANALYSIS_SYSTEM_PROMPT)
