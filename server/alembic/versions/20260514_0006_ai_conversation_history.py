"""add ai conversation history

Revision ID: 20260514_0006
Revises: 20260514_0005
Create Date: 2026-05-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260514_0006"
down_revision: Union[str, None] = "20260514_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_assistant_logs",
        sa.Column("conversation_id", sa.String(length=64), nullable=False, server_default=""),
    )
    op.create_index("ix_ai_assistant_logs_conversation_id", "ai_assistant_logs", ["conversation_id"])
    op.alter_column("ai_assistant_logs", "conversation_id", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_ai_assistant_logs_conversation_id", table_name="ai_assistant_logs")
    op.drop_column("ai_assistant_logs", "conversation_id")
