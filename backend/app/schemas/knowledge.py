from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel

ArticleType = Literal["article", "video"]


class KnowledgeCategoryOut(CamelModel):
    id: str
    name: str
    slug: str
    description: str
    sort_order: int


class KnowledgeArticleListItem(CamelModel):
    id: str
    category_id: str
    category_name: str
    title: str
    summary: str
    article_type: ArticleType
    author_name: str
    author_title: str
    source: str
    read_time_minutes: int
    cover_color: str
    view_count: int
    like_count: int
    is_liked: bool
    is_bookmarked: bool
    published_at: datetime


class KnowledgeArticleDetail(KnowledgeArticleListItem):
    content: str


class KnowledgeArticleActionState(CamelModel):
    article_id: str
    view_count: int
    like_count: int
    is_liked: bool
    is_bookmarked: bool


class KnowledgeArticleQuery(CamelModel):
    q: str | None = Field(default=None, max_length=120)
    category_id: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
