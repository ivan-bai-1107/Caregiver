from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.redis import redis_get_json, redis_set_json
from app.core.responses import serialize_payload, success_response
from app.models.user import User
from app.services.cache_service import KNOWLEDGE_CATEGORIES_CACHE_KEY
from app.services.knowledge_service import (
    bookmark_article,
    get_article_detail,
    get_related_articles,
    increment_article_view,
    like_article,
    list_articles,
    list_categories,
    remove_article_bookmark,
    remove_article_like,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/categories")
def read_categories(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    cached = redis_get_json(KNOWLEDGE_CATEGORIES_CACHE_KEY)
    if cached is not None:
        return success_response(cached)

    categories = list_categories(db)
    redis_set_json(KNOWLEDGE_CATEGORIES_CACHE_KEY, 600, serialize_payload(categories))
    return success_response(categories)


@router.get("/articles")
def read_articles(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    category_id: Annotated[str | None, Query(alias="categoryId")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> dict[str, object]:
    return success_response(list_articles(db, current_user, q, category_id, page, page_size))


@router.get("/articles/{article_id}")
def read_article(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_article_detail(db, current_user, article_id))


@router.get("/articles/{article_id}/related")
def read_related_articles(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_related_articles(db, current_user, article_id))


@router.post("/articles/{article_id}/view")
def view_article(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(increment_article_view(db, current_user, article_id))


@router.post("/articles/{article_id}/like")
def like_article_endpoint(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(like_article(db, current_user, article_id))


@router.delete("/articles/{article_id}/like")
def remove_article_like_endpoint(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(remove_article_like(db, current_user, article_id))


@router.post("/articles/{article_id}/bookmark")
def bookmark_article_endpoint(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(bookmark_article(db, current_user, article_id))


@router.delete("/articles/{article_id}/bookmark")
def remove_article_bookmark_endpoint(
    article_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(remove_article_bookmark(db, current_user, article_id))
