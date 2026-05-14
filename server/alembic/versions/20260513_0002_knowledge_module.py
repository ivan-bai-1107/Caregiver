"""add knowledge module

Revision ID: 20260513_0002
Revises: 20260513_0001
Create Date: 2026-05-13
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260513_0002"
down_revision: Union[str, None] = "20260513_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "knowledge_categories",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_knowledge_categories_slug", "knowledge_categories", ["slug"])

    op.create_table(
        "knowledge_articles",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("category_id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("article_type", sa.String(length=20), nullable=False),
        sa.Column("author_name", sa.String(length=80), nullable=False),
        sa.Column("author_title", sa.String(length=120), nullable=False),
        sa.Column("source", sa.String(length=160), nullable=False),
        sa.Column("read_time_minutes", sa.Integer(), nullable=False),
        sa.Column("cover_color", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("view_count", sa.Integer(), nullable=False),
        sa.Column("like_count", sa.Integer(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("article_type in ('article', 'video')", name="ck_knowledge_articles_article_type"),
        sa.CheckConstraint("status in ('published', 'draft', 'archived')", name="ck_knowledge_articles_status"),
        sa.ForeignKeyConstraint(["category_id"], ["knowledge_categories.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_articles_category_id", "knowledge_articles", ["category_id"])
    op.create_index("ix_knowledge_articles_title", "knowledge_articles", ["title"])
    op.create_index("ix_knowledge_articles_article_type", "knowledge_articles", ["article_type"])
    op.create_index("ix_knowledge_articles_status", "knowledge_articles", ["status"])

    op.create_table(
        "user_knowledge_likes",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("article_id", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["article_id"], ["knowledge_articles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "article_id", name="uq_user_knowledge_likes_user_article"),
    )
    op.create_index("ix_user_knowledge_likes_user_id", "user_knowledge_likes", ["user_id"])
    op.create_index("ix_user_knowledge_likes_article_id", "user_knowledge_likes", ["article_id"])

    op.create_table(
        "user_knowledge_bookmarks",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("article_id", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["article_id"], ["knowledge_articles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "article_id", name="uq_user_knowledge_bookmarks_user_article"),
    )
    op.create_index("ix_user_knowledge_bookmarks_user_id", "user_knowledge_bookmarks", ["user_id"])
    op.create_index("ix_user_knowledge_bookmarks_article_id", "user_knowledge_bookmarks", ["article_id"])


def downgrade() -> None:
    op.drop_index("ix_user_knowledge_bookmarks_article_id", table_name="user_knowledge_bookmarks")
    op.drop_index("ix_user_knowledge_bookmarks_user_id", table_name="user_knowledge_bookmarks")
    op.drop_table("user_knowledge_bookmarks")
    op.drop_index("ix_user_knowledge_likes_article_id", table_name="user_knowledge_likes")
    op.drop_index("ix_user_knowledge_likes_user_id", table_name="user_knowledge_likes")
    op.drop_table("user_knowledge_likes")
    op.drop_index("ix_knowledge_articles_status", table_name="knowledge_articles")
    op.drop_index("ix_knowledge_articles_article_type", table_name="knowledge_articles")
    op.drop_index("ix_knowledge_articles_title", table_name="knowledge_articles")
    op.drop_index("ix_knowledge_articles_category_id", table_name="knowledge_articles")
    op.drop_table("knowledge_articles")
    op.drop_index("ix_knowledge_categories_slug", table_name="knowledge_categories")
    op.drop_table("knowledge_categories")
