"""add prompt templates and knowledge video url

Revision ID: 20260514_0004
Revises: 20260513_0003
Create Date: 2026-05-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260514_0004"
down_revision: Union[str, None] = "20260513_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "knowledge_articles",
        sa.Column("video_url", sa.Text(), nullable=False, server_default=""),
    )

    op.create_table(
        "prompt_templates",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status in ('active', 'disabled')", name="ck_prompt_templates_status"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key"),
    )
    op.create_index("ix_prompt_templates_key", "prompt_templates", ["key"])
    op.create_index("ix_prompt_templates_status", "prompt_templates", ["status"])


def downgrade() -> None:
    op.drop_index("ix_prompt_templates_status", table_name="prompt_templates")
    op.drop_index("ix_prompt_templates_key", table_name="prompt_templates")
    op.drop_table("prompt_templates")
    op.drop_column("knowledge_articles", "video_url")
