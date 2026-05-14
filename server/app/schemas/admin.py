from datetime import datetime
from typing import Any, Literal

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel
from app.schemas.community import CommunityPostOut, ReviewStatus

UserStatus = Literal["active", "disabled"]
AdminStatus = Literal["active", "disabled"]
ArticleStatus = Literal["published", "draft", "archived"]
PromptStatus = Literal["active", "disabled"]


class AdminLoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=1)


class AdminTokenResponse(CamelModel):
    token: str


class AdminMe(CamelModel):
    id: str
    username: str
    email: EmailStr


class AdminDashboardSummary(CamelModel):
    user_count: int
    patient_count: int
    record_count: int
    task_count: int
    pending_post_count: int
    pending_comment_count: int
    knowledge_article_count: int
    ai_log_count: int


class AdminUserOut(CamelModel):
    id: str
    username: str
    email: EmailStr
    status: UserStatus
    patient_count: int = 0
    created_at: datetime


class UserStatusUpdate(CamelModel):
    status: UserStatus


class AdminReviewUpdate(CamelModel):
    status: ReviewStatus
    reason: str = ""


class AdminKnowledgeArticleCreate(CamelModel):
    category_id: str
    title: str = Field(min_length=1, max_length=160)
    summary: str = ""
    content: str = ""
    article_type: Literal["article", "video"] = "article"
    author_name: str = ""
    author_title: str = ""
    source: str = ""
    video_url: str = ""
    read_time_minutes: int = Field(default=5, ge=1)
    cover_color: str = "primary"
    status: ArticleStatus = "draft"


class AdminKnowledgeArticleUpdate(AdminKnowledgeArticleCreate):
    pass


class AdminKnowledgeArticleStatusUpdate(CamelModel):
    status: ArticleStatus


class AdminKnowledgeArticleOut(CamelModel):
    id: str
    category_id: str
    category_name: str
    title: str
    summary: str
    content: str
    article_type: Literal["article", "video"]
    author_name: str
    author_title: str
    source: str
    video_url: str
    read_time_minutes: int
    cover_color: str
    status: ArticleStatus
    view_count: int
    like_count: int
    published_at: datetime
    created_at: datetime
    updated_at: datetime


class AdminPromptTemplateUpdate(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = ""
    content: str = Field(min_length=20)
    status: PromptStatus = "active"


class AdminPromptTemplateOut(CamelModel):
    id: str
    key: str
    name: str
    description: str
    content: str
    status: PromptStatus
    is_system: bool
    created_at: datetime
    updated_at: datetime


class AdminAiLogOut(CamelModel):
    id: str
    user_id: str
    username: str
    message: str
    intent: str
    answer_text: str
    draft_type: str | None
    draft_payload: dict[str, Any] | None
    sources: list[str]
    risk_note: str
    created_at: datetime


class AdminReviewPostsResponse(CamelModel):
    items: list[CommunityPostOut]
