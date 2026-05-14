from __future__ import annotations

from app.core.redis import redis_delete, redis_delete_pattern

ADMIN_DASHBOARD_SUMMARY_CACHE_KEY = "cache:admin:dashboard_summary"
KNOWLEDGE_CATEGORIES_CACHE_KEY = "cache:knowledge:categories"


def care_workbench_cache_key(user_id: str) -> str:
    return f"cache:care:workbench:{user_id}"


def invalidate_admin_dashboard_cache() -> None:
    redis_delete(ADMIN_DASHBOARD_SUMMARY_CACHE_KEY)


def invalidate_care_workbench_cache(user_id: str) -> None:
    redis_delete(care_workbench_cache_key(user_id))


def invalidate_knowledge_categories_cache() -> None:
    redis_delete(KNOWLEDGE_CATEGORIES_CACHE_KEY)


def trend_analysis_cache_pattern(user_id: str, patient_id: str) -> str:
    return f"cache:trend:analysis:{user_id}:{patient_id}:*"


def invalidate_trend_analysis_cache(user_id: str, patient_id: str) -> None:
    redis_delete_pattern(trend_analysis_cache_pattern(user_id, patient_id))
    redis_delete_pattern(f"cache:trend:data:{user_id}:{patient_id}:*")
