from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.core.redis import redis_get_json, redis_set_json
from app.core.responses import serialize_payload, success_response
from app.models.admin import AdminUser
from app.schemas.admin import (
    AdminKnowledgeArticleCreate,
    AdminKnowledgeArticleStatusUpdate,
    AdminKnowledgeArticleUpdate,
    AdminLoginRequest,
    AdminPromptTemplateUpdate,
    AdminReviewUpdate,
    UserStatusUpdate,
)
from app.services.admin_service import (
    admin_me,
    authenticate_admin,
    create_admin_article,
    get_ai_log,
    get_dashboard_summary,
    get_user_detail,
    list_admin_prompts,
    list_admin_categories,
    list_admin_articles,
    list_ai_logs,
    list_review_posts,
    list_users,
    update_admin_article,
    update_admin_article_status,
    update_admin_prompt,
    update_review_post,
    update_user_status,
)
from app.services.cache_service import ADMIN_DASHBOARD_SUMMARY_CACHE_KEY

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/auth/login")
def admin_login(
    payload: AdminLoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    return success_response(authenticate_admin(db, payload))


@router.get("/me")
def read_admin_me(current_admin: Annotated[AdminUser, Depends(get_current_admin)]) -> dict[str, object]:
    return success_response(admin_me(current_admin))


@router.get("/dashboard/summary")
def read_dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    cached = redis_get_json(ADMIN_DASHBOARD_SUMMARY_CACHE_KEY)
    if cached is not None:
        return success_response(cached)

    summary = get_dashboard_summary(db)
    redis_set_json(ADMIN_DASHBOARD_SUMMARY_CACHE_KEY, 60, serialize_payload(summary))
    return success_response(summary)


@router.get("/users")
def read_users(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
    keyword: Annotated[str | None, Query(max_length=120)] = None,
) -> dict[str, object]:
    return success_response(list_users(db, keyword, page, page_size))


@router.get("/users/{user_id}")
def read_user(
    user_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(get_user_detail(db, user_id))


@router.put("/users/{user_id}/status")
def update_user_status_endpoint(
    user_id: str,
    payload: UserStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(update_user_status(db, user_id, payload))


@router.get("/reviews/posts")
def read_review_posts(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> dict[str, object]:
    return success_response(list_review_posts(db, status_filter, page, page_size))


@router.put("/reviews/posts/{post_id}")
def update_review_post_endpoint(
    post_id: str,
    payload: AdminReviewUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(update_review_post(db, post_id, payload))


@router.get("/knowledge/articles")
def read_admin_articles(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> dict[str, object]:
    return success_response(list_admin_articles(db, status_filter, page, page_size))


@router.get("/prompts")
def read_admin_prompts(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(list_admin_prompts(db))


@router.put("/prompts/{prompt_id}")
def update_admin_prompt_endpoint(
    prompt_id: str,
    payload: AdminPromptTemplateUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(update_admin_prompt(db, prompt_id, payload))


@router.get("/knowledge/categories")
def read_admin_categories(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(list_admin_categories(db))


@router.post("/knowledge/articles")
def create_admin_article_endpoint(
    payload: AdminKnowledgeArticleCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(create_admin_article(db, payload))


@router.put("/knowledge/articles/{article_id}")
def update_admin_article_endpoint(
    article_id: str,
    payload: AdminKnowledgeArticleUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(update_admin_article(db, article_id, payload))


@router.put("/knowledge/articles/{article_id}/status")
def update_admin_article_status_endpoint(
    article_id: str,
    payload: AdminKnowledgeArticleStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(update_admin_article_status(db, article_id, payload))


@router.get("/ai-logs")
def read_ai_logs(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
    intent: Annotated[str | None, Query(max_length=40)] = None,
) -> dict[str, object]:
    return success_response(list_ai_logs(db, intent, page, page_size))


@router.get("/ai-logs/{log_id}")
def read_ai_log(
    log_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, object]:
    return success_response(get_ai_log(db, log_id))
