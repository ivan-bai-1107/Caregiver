from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.community import CommunityCommentCreate, CommunityPostCreate, CommunityPostReportCreate
from app.services.community_service import (
    bookmark_post,
    create_comment,
    create_post,
    get_post_detail,
    like_post,
    list_comments,
    list_posts,
    related_posts,
    remove_bookmark,
    report_post,
    user_posts,
)

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/posts")
def read_posts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: Annotated[str | None, Query(max_length=120)] = None,
    tag: Annotated[str | None, Query(max_length=40)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> dict[str, object]:
    return success_response(list_posts(db, current_user, q, tag, page, page_size))


@router.post("/posts")
def create_post_endpoint(
    payload: CommunityPostCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(create_post(db, current_user, payload))


@router.get("/posts/{post_id}")
def read_post(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(get_post_detail(db, current_user, post_id))


@router.get("/posts/{post_id}/comments")
def read_comments(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(list_comments(db, current_user, post_id))


@router.post("/posts/{post_id}/comments")
def create_comment_endpoint(
    post_id: str,
    payload: CommunityCommentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(create_comment(db, current_user, post_id, payload))


@router.post("/posts/{post_id}/like")
def like_post_endpoint(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(like_post(db, current_user, post_id))


@router.post("/posts/{post_id}/bookmark")
def bookmark_post_endpoint(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(bookmark_post(db, current_user, post_id))


@router.delete("/posts/{post_id}/bookmark")
def delete_bookmark_endpoint(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(remove_bookmark(db, current_user, post_id))


@router.post("/posts/{post_id}/report")
def report_post_endpoint(
    post_id: str,
    payload: CommunityPostReportCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(report_post(db, current_user, post_id, payload))


@router.get("/posts/{post_id}/related")
def related_posts_endpoint(
    post_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(related_posts(db, current_user, post_id))


@router.get("/users/{author_id}/posts")
def user_posts_endpoint(
    author_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, object]:
    return success_response(user_posts(db, current_user, author_id))
