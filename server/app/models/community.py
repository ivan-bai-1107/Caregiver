from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.utils import new_id, utc_now


COMMUNITY_STATUS_CHECK = "status in ('pending', 'passed', 'rejected')"


class CommunityPost(Base):
    __tablename__ = "community_posts"
    __table_args__ = (CheckConstraint(COMMUNITY_STATUS_CHECK, name="ck_community_posts_status"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("cpost"))
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tag: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending", index=True)
    review_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    like_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    report_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    author = relationship("User", back_populates="community_posts")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("CommunityPostLike", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("CommunityPostBookmark", back_populates="post", cascade="all, delete-orphan")
    reports = relationship("CommunityPostReport", back_populates="post", cascade="all, delete-orphan")


class CommunityComment(Base):
    __tablename__ = "community_comments"
    __table_args__ = (CheckConstraint(COMMUNITY_STATUS_CHECK, name="ck_community_comments_status"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("cmt"))
    post_id: Mapped[str] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending", index=True)
    review_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    post = relationship("CommunityPost", back_populates="comments")
    author = relationship("User", back_populates="community_comments")


class CommunityPostLike(Base):
    __tablename__ = "community_post_likes"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_community_post_likes_user_post"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("cpl"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="community_likes")
    post = relationship("CommunityPost", back_populates="likes")


class CommunityPostBookmark(Base):
    __tablename__ = "community_post_bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_community_post_bookmarks_user_post"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("cpb"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="community_bookmarks")
    post = relationship("CommunityPost", back_populates="bookmarks")


class CommunityPostReport(Base):
    __tablename__ = "community_post_reports"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: new_id("cpr"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[str] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="community_reports")
    post = relationship("CommunityPost", back_populates="reports")
