from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel

ReviewStatus = Literal["pending", "passed", "rejected"]


class CommunityPostCreate(CamelModel):
    title: str = Field(min_length=1, max_length=160)
    content: str = Field(min_length=1, max_length=4000)
    tag: str = Field(min_length=1, max_length=40)


class CommunityCommentCreate(CamelModel):
    content: str = Field(min_length=1, max_length=1000)


class CommunityPostReportCreate(CamelModel):
    reason: str = Field(default="用户举报", max_length=500)


class CommunityAuthor(CamelModel):
    id: str
    username: str


class CommunityPostOut(CamelModel):
    id: str
    author: CommunityAuthor
    title: str
    content: str
    tag: str
    status: ReviewStatus
    review_reason: str
    view_count: int
    like_count: int
    comment_count: int
    report_count: int
    is_liked: bool
    is_bookmarked: bool
    created_at: datetime
    updated_at: datetime


class CommunityCommentOut(CamelModel):
    id: str
    post_id: str
    author: CommunityAuthor
    content: str
    status: ReviewStatus
    review_reason: str
    created_at: datetime
    updated_at: datetime


class CommunityPostActionState(CamelModel):
    post_id: str
    like_count: int
    comment_count: int
    report_count: int
    is_liked: bool
    is_bookmarked: bool


class ReviewUpdate(CamelModel):
    status: ReviewStatus
    reason: str = ""
