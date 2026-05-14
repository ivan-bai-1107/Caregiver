from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.community import (
    CommunityComment,
    CommunityPost,
    CommunityPostBookmark,
    CommunityPostLike,
    CommunityPostReport,
)
from app.models.user import User
from app.schemas.base import PagedResponse
from app.schemas.community import (
    CommunityAuthor,
    CommunityCommentCreate,
    CommunityCommentOut,
    CommunityPostActionState,
    CommunityPostCreate,
    CommunityPostOut,
    CommunityPostReportCreate,
    ReviewStatus,
)
from app.services.cache_service import invalidate_admin_dashboard_cache


def to_author(user: User) -> CommunityAuthor:
    return CommunityAuthor(id=user.id, username=user.username)


def post_state(db: Session, user: User, post_id: str) -> tuple[bool, bool]:
    is_liked = (
        db.scalar(
            select(CommunityPostLike.id).where(
                CommunityPostLike.user_id == user.id,
                CommunityPostLike.post_id == post_id,
            )
        )
        is not None
    )
    is_bookmarked = (
        db.scalar(
            select(CommunityPostBookmark.id).where(
                CommunityPostBookmark.user_id == user.id,
                CommunityPostBookmark.post_id == post_id,
            )
        )
        is not None
    )
    return is_liked, is_bookmarked


def to_post_out(db: Session, user: User, post: CommunityPost) -> CommunityPostOut:
    is_liked, is_bookmarked = post_state(db, user, post.id)
    return CommunityPostOut(
        id=post.id,
        author=to_author(post.author),
        title=post.title,
        content=post.content,
        tag=post.tag,
        status=post.status,
        review_reason=post.review_reason,
        view_count=post.view_count,
        like_count=post.like_count,
        comment_count=post.comment_count,
        report_count=post.report_count,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def to_comment_out(comment: CommunityComment) -> CommunityCommentOut:
    return CommunityCommentOut(
        id=comment.id,
        post_id=comment.post_id,
        author=to_author(comment.author),
        content=comment.content,
        status=comment.status,
        review_reason=comment.review_reason,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def visible_post_filters(user: User) -> list[object]:
    return [or_(CommunityPost.status == "passed", CommunityPost.author_id == user.id)]


def get_post_or_404(db: Session, user: User, post_id: str) -> CommunityPost:
    post = db.scalar(
        select(CommunityPost)
        .where(CommunityPost.id == post_id, *visible_post_filters(user))
        .options(selectinload(CommunityPost.author))
    )
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子不存在或暂不可见。")
    return post


def list_posts(
    db: Session,
    user: User,
    q: str | None = None,
    tag: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> PagedResponse[CommunityPostOut]:
    filters = visible_post_filters(user)
    keyword = q.strip() if q else ""
    if keyword:
        filters.append(
            or_(
                CommunityPost.title.ilike(f"%{keyword}%"),
                CommunityPost.content.ilike(f"%{keyword}%"),
            )
        )
    if tag:
        filters.append(CommunityPost.tag == tag)

    total = db.scalar(select(func.count(CommunityPost.id)).where(*filters)) or 0
    posts = db.scalars(
        select(CommunityPost)
        .where(*filters)
        .options(selectinload(CommunityPost.author))
        .order_by(CommunityPost.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_post_out(db, user, post) for post in posts],
        page=page,
        page_size=page_size,
        total=total,
    )


def create_post(db: Session, user: User, payload: CommunityPostCreate) -> CommunityPostOut:
    post = CommunityPost(
        author_id=user.id,
        title=payload.title,
        content=payload.content,
        tag=payload.tag,
        status="pending",
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    db.refresh(post, attribute_names=["author"])
    invalidate_admin_dashboard_cache()
    return to_post_out(db, user, post)


def get_post_detail(db: Session, user: User, post_id: str) -> CommunityPostOut:
    post = get_post_or_404(db, user, post_id)
    post.view_count += 1
    db.commit()
    db.refresh(post)
    db.refresh(post, attribute_names=["author"])
    return to_post_out(db, user, post)


def list_comments(db: Session, user: User, post_id: str) -> list[CommunityCommentOut]:
    get_post_or_404(db, user, post_id)
    comments = db.scalars(
        select(CommunityComment)
        .where(
            CommunityComment.post_id == post_id,
            or_(CommunityComment.status == "passed", CommunityComment.author_id == user.id),
        )
        .options(selectinload(CommunityComment.author))
        .order_by(CommunityComment.created_at.asc())
    ).all()
    return [to_comment_out(comment) for comment in comments]


def create_comment(db: Session, user: User, post_id: str, payload: CommunityCommentCreate) -> CommunityCommentOut:
    get_post_or_404(db, user, post_id)
    comment = CommunityComment(
        post_id=post_id,
        author_id=user.id,
        content=payload.content,
        status="pending",
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    db.refresh(comment, attribute_names=["author"])
    invalidate_admin_dashboard_cache()
    return to_comment_out(comment)


def to_action_state(db: Session, user: User, post: CommunityPost) -> CommunityPostActionState:
    is_liked, is_bookmarked = post_state(db, user, post.id)
    return CommunityPostActionState(
        post_id=post.id,
        like_count=post.like_count,
        comment_count=post.comment_count,
        report_count=post.report_count,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
    )


def like_post(db: Session, user: User, post_id: str) -> CommunityPostActionState:
    post = get_post_or_404(db, user, post_id)
    existing = db.scalar(
        select(CommunityPostLike).where(
            CommunityPostLike.user_id == user.id,
            CommunityPostLike.post_id == post.id,
        )
    )
    if existing is None:
        db.add(CommunityPostLike(user_id=user.id, post_id=post.id))
        post.like_count += 1
        db.commit()
        db.refresh(post)
    return to_action_state(db, user, post)


def bookmark_post(db: Session, user: User, post_id: str) -> CommunityPostActionState:
    post = get_post_or_404(db, user, post_id)
    existing = db.scalar(
        select(CommunityPostBookmark).where(
            CommunityPostBookmark.user_id == user.id,
            CommunityPostBookmark.post_id == post.id,
        )
    )
    if existing is None:
        db.add(CommunityPostBookmark(user_id=user.id, post_id=post.id))
        db.commit()
    return to_action_state(db, user, post)


def remove_bookmark(db: Session, user: User, post_id: str) -> CommunityPostActionState:
    post = get_post_or_404(db, user, post_id)
    existing = db.scalar(
        select(CommunityPostBookmark).where(
            CommunityPostBookmark.user_id == user.id,
            CommunityPostBookmark.post_id == post.id,
        )
    )
    if existing is not None:
        db.delete(existing)
        db.commit()
    return to_action_state(db, user, post)


def report_post(
    db: Session,
    user: User,
    post_id: str,
    payload: CommunityPostReportCreate,
) -> CommunityPostActionState:
    post = get_post_or_404(db, user, post_id)
    db.add(CommunityPostReport(user_id=user.id, post_id=post.id, reason=payload.reason))
    post.report_count += 1
    db.commit()
    db.refresh(post)
    return to_action_state(db, user, post)


def related_posts(db: Session, user: User, post_id: str) -> list[CommunityPostOut]:
    post = get_post_or_404(db, user, post_id)
    posts = db.scalars(
        select(CommunityPost)
        .where(CommunityPost.id != post.id, CommunityPost.tag == post.tag, CommunityPost.status == "passed")
        .options(selectinload(CommunityPost.author))
        .order_by(CommunityPost.created_at.desc())
        .limit(3)
    ).all()
    return [to_post_out(db, user, item) for item in posts]


def user_posts(db: Session, user: User, author_id: str) -> list[CommunityPostOut]:
    posts = db.scalars(
        select(CommunityPost)
        .where(CommunityPost.author_id == author_id, *visible_post_filters(user))
        .options(selectinload(CommunityPost.author))
        .order_by(CommunityPost.created_at.desc())
        .limit(5)
    ).all()
    return [to_post_out(db, user, item) for item in posts]


def recount_post_comments(db: Session, post_id: str) -> None:
    count = db.scalar(
        select(func.count(CommunityComment.id)).where(
            CommunityComment.post_id == post_id,
            CommunityComment.status == "passed",
        )
    ) or 0
    post = db.scalar(select(CommunityPost).where(CommunityPost.id == post_id))
    if post is not None:
        post.comment_count = count
