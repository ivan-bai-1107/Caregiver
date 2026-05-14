from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.admin import PromptTemplate
from app.schemas.admin import AdminPromptTemplateOut, AdminPromptTemplateUpdate
from app.services.deepseek_service import SYSTEM_PROMPT

AI_ASSISTANT_SYSTEM_PROMPT_KEY = "ai_assistant_system"


def ensure_default_prompt_template(db: Session) -> PromptTemplate:
    prompt = db.scalar(select(PromptTemplate).where(PromptTemplate.key == AI_ASSISTANT_SYSTEM_PROMPT_KEY))
    if prompt is not None:
        return prompt

    prompt = PromptTemplate(
        key=AI_ASSISTANT_SYSTEM_PROMPT_KEY,
        name="AI 助手系统 Prompt",
        description="控制前台 AI 助手的身份、安全边界和结构化 JSON 输出规则。",
        content=SYSTEM_PROMPT,
        status="active",
        is_system=True,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


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
    ensure_default_prompt_template(db)
    prompts = db.scalars(select(PromptTemplate).order_by(PromptTemplate.created_at.asc())).all()
    return [to_prompt_out(prompt) for prompt in prompts]


def update_prompt_template(db: Session, prompt_id: str, payload: AdminPromptTemplateUpdate) -> AdminPromptTemplateOut:
    ensure_default_prompt_template(db)
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


def get_active_ai_system_prompt(db: Session) -> str:
    prompt = ensure_default_prompt_template(db)
    if prompt.status != "active" or not prompt.content.strip():
        return SYSTEM_PROMPT
    return prompt.content
