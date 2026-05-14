from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


class KnowledgeCategory(Base):
    __tablename__ = "knowledge_categories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("kcat"))
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    articles = relationship("KnowledgeArticle", back_populates="category", cascade="all, delete-orphan")


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    __table_args__ = (
        CheckConstraint("article_type in ('article', 'video')", name="ck_knowledge_articles_article_type"),
        CheckConstraint("status in ('published', 'draft', 'archived')", name="ck_knowledge_articles_status"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("kart"))
    category_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    article_type: Mapped[str] = mapped_column(String(20), nullable=False, default="article", index=True)
    author_name: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    author_title: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    source: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    video_url: Mapped[str] = mapped_column(Text, nullable=False, default="")
    read_time_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    cover_color: Mapped[str] = mapped_column(String(80), nullable=False, default="primary")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="published", index=True)
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    category = relationship("KnowledgeCategory", back_populates="articles")
    likes = relationship("UserKnowledgeLike", back_populates="article", cascade="all, delete-orphan")
    bookmarks = relationship("UserKnowledgeBookmark", back_populates="article", cascade="all, delete-orphan")


class UserKnowledgeLike(Base):
    __tablename__ = "user_knowledge_likes"
    __table_args__ = (UniqueConstraint("user_id", "article_id", name="uq_user_knowledge_likes_user_article"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("ukl"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    article_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="knowledge_likes")
    article = relationship("KnowledgeArticle", back_populates="likes")


class UserKnowledgeBookmark(Base):
    __tablename__ = "user_knowledge_bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "article_id", name="uq_user_knowledge_bookmarks_user_article"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("ukb"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    article_id: Mapped[str] = mapped_column(
        ForeignKey("knowledge_articles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="knowledge_bookmarks")
    article = relationship("KnowledgeArticle", back_populates="bookmarks")
