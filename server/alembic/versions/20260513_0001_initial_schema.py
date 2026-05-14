"""initial caregiver schema

Revision ID: 20260513_0001
Revises:
Create Date: 2026-05-13
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260513_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "email_verification_codes",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=16), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", "code", "created_at", name="uq_email_code_created_at"),
    )
    op.create_index("ix_email_verification_codes_email", "email_verification_codes", ["email"])

    op.create_table(
        "patients",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(length=16), nullable=False),
        sa.Column("profile_note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("gender in ('男', '女', '其他')", name="ck_patients_gender"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_patients_user_id", "patients", ["user_id"])

    op.create_table(
        "user_notification_settings",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("task_reminder_enabled", sa.Boolean(), nullable=False),
        sa.Column("health_alert_enabled", sa.Boolean(), nullable=False),
        sa.Column("system_notification_enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_notification_settings_user_id"),
    )
    op.create_index("ix_user_notification_settings_user_id", "user_notification_settings", ["user_id"])

    op.create_table(
        "user_preferences",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("theme", sa.String(length=32), nullable=False),
        sa.Column("language", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_preferences_user_id"),
    )
    op.create_index("ix_user_preferences_user_id", "user_preferences", ["user_id"])

    op.create_table(
        "care_records",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("patient_id", sa.String(length=64), nullable=False),
        sa.Column("record_type", sa.String(length=40), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "record_type in ('blood_pressure', 'temperature', 'blood_sugar', 'heart_rate', 'medication', 'diet', 'other')",
            name="ck_care_records_record_type",
        ),
        sa.CheckConstraint("source in ('manual', 'ai')", name="ck_care_records_source"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_care_records_patient_id", "care_records", ["patient_id"])
    op.create_index("ix_care_records_record_type", "care_records", ["record_type"])
    op.create_index("ix_care_records_occurred_at", "care_records", ["occurred_at"])

    op.create_table(
        "care_tasks",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("patient_id", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("task_type", sa.String(length=40), nullable=False),
        sa.Column("remind_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("repeat_rule", sa.String(length=16), nullable=False),
        sa.Column("priority", sa.String(length=16), nullable=False),
        sa.Column("remind_offset_minutes", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "task_type in ('blood_pressure', 'blood_sugar', 'medication', 'diet', 'rehab', 'appointment', 'nutrition', 'other')",
            name="ck_care_tasks_task_type",
        ),
        sa.CheckConstraint("repeat_rule in ('once', 'daily', 'weekly', 'monthly')", name="ck_care_tasks_repeat_rule"),
        sa.CheckConstraint("priority in ('low', 'normal', 'high')", name="ck_care_tasks_priority"),
        sa.CheckConstraint("status in ('pending', 'completed', 'scheduled')", name="ck_care_tasks_status"),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_care_tasks_patient_id", "care_tasks", ["patient_id"])
    op.create_index("ix_care_tasks_task_type", "care_tasks", ["task_type"])
    op.create_index("ix_care_tasks_remind_time", "care_tasks", ["remind_time"])
    op.create_index("ix_care_tasks_status", "care_tasks", ["status"])

    op.create_table(
        "care_metrics",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("care_record_id", sa.String(length=64), nullable=False),
        sa.Column("metric_key", sa.String(length=80), nullable=False),
        sa.Column("value_numeric", sa.Numeric(12, 2), nullable=True),
        sa.Column("value_text", sa.Text(), nullable=True),
        sa.Column("unit", sa.String(length=40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["care_record_id"], ["care_records.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_care_metrics_care_record_id", "care_metrics", ["care_record_id"])
    op.create_index("ix_care_metrics_metric_key", "care_metrics", ["metric_key"])

    op.create_table(
        "ai_assistant_logs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("intent", sa.String(length=32), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=False),
        sa.Column("draft_type", sa.String(length=16), nullable=True),
        sa.Column("draft_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sources", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("risk_note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_assistant_logs_user_id", "ai_assistant_logs", ["user_id"])
    op.create_index("ix_ai_assistant_logs_intent", "ai_assistant_logs", ["intent"])


def downgrade() -> None:
    op.drop_index("ix_ai_assistant_logs_intent", table_name="ai_assistant_logs")
    op.drop_index("ix_ai_assistant_logs_user_id", table_name="ai_assistant_logs")
    op.drop_table("ai_assistant_logs")
    op.drop_index("ix_care_metrics_metric_key", table_name="care_metrics")
    op.drop_index("ix_care_metrics_care_record_id", table_name="care_metrics")
    op.drop_table("care_metrics")
    op.drop_index("ix_care_tasks_status", table_name="care_tasks")
    op.drop_index("ix_care_tasks_remind_time", table_name="care_tasks")
    op.drop_index("ix_care_tasks_task_type", table_name="care_tasks")
    op.drop_index("ix_care_tasks_patient_id", table_name="care_tasks")
    op.drop_table("care_tasks")
    op.drop_index("ix_care_records_occurred_at", table_name="care_records")
    op.drop_index("ix_care_records_record_type", table_name="care_records")
    op.drop_index("ix_care_records_patient_id", table_name="care_records")
    op.drop_table("care_records")
    op.drop_index("ix_user_preferences_user_id", table_name="user_preferences")
    op.drop_table("user_preferences")
    op.drop_index("ix_user_notification_settings_user_id", table_name="user_notification_settings")
    op.drop_table("user_notification_settings")
    op.drop_index("ix_patients_user_id", table_name="patients")
    op.drop_table("patients")
    op.drop_index("ix_email_verification_codes_email", table_name="email_verification_codes")
    op.drop_table("email_verification_codes")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
