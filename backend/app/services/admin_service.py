from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.security import create_access_token, hash_password, verify_password
from app.models.admin import AdminUser
from app.models.ai_log import AiAssistantLog
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.community import CommunityComment, CommunityPost
from app.models.knowledge import KnowledgeArticle, KnowledgeCategory
from app.models.patient import Patient
from app.models.user import User
from app.models.utils import utc_now
from app.schemas.admin import (
    AdminAiLogOut,
    AdminDashboardSummary,
    AdminKnowledgeArticleCreate,
    AdminKnowledgeArticleOut,
    AdminKnowledgeArticleStatusUpdate,
    AdminKnowledgeArticleUpdate,
    AdminLoginRequest,
    AdminMe,
    AdminTokenResponse,
    AdminUserOut,
    AdminReviewUpdate,
    UserStatusUpdate,
)
from app.schemas.base import PagedResponse
from app.schemas.community import CommunityAuthor, CommunityCommentOut, CommunityPostOut
from app.services.community_service import recount_post_comments


def authenticate_admin(db: Session, payload: AdminLoginRequest) -> AdminTokenResponse:
    admin = db.scalar(select(AdminUser).where(AdminUser.email == payload.email))
    if admin is None or admin.status != "active" or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="管理员账号或密码错误。")
    return AdminTokenResponse(token=create_access_token(admin.id))


def admin_me(admin: AdminUser) -> AdminMe:
    return AdminMe(id=admin.id, username=admin.username, email=admin.email)


def get_dashboard_summary(db: Session) -> AdminDashboardSummary:
    return AdminDashboardSummary(
        user_count=db.scalar(select(func.count(User.id))) or 0,
        patient_count=db.scalar(select(func.count(Patient.id))) or 0,
        record_count=db.scalar(select(func.count(CareRecord.id))) or 0,
        task_count=db.scalar(select(func.count(CareTask.id))) or 0,
        pending_post_count=db.scalar(select(func.count(CommunityPost.id)).where(CommunityPost.status == "pending")) or 0,
        pending_comment_count=db.scalar(select(func.count(CommunityComment.id)).where(CommunityComment.status == "pending")) or 0,
        knowledge_article_count=db.scalar(select(func.count(KnowledgeArticle.id))) or 0,
        ai_log_count=db.scalar(select(func.count(AiAssistantLog.id))) or 0,
    )


def to_admin_user_out(db: Session, user: User) -> AdminUserOut:
    patient_count = db.scalar(select(func.count(Patient.id)).where(Patient.user_id == user.id)) or 0
    return AdminUserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        status=user.status,
        patient_count=patient_count,
        created_at=user.created_at,
    )


def list_users(db: Session, keyword: str | None, page: int, page_size: int) -> PagedResponse[AdminUserOut]:
    filters = []
    value = keyword.strip() if keyword else ""
    if value:
        filters.append((User.username.ilike(f"%{value}%")) | (User.email.ilike(f"%{value}%")))
    total = db.scalar(select(func.count(User.id)).where(*filters)) or 0
    users = db.scalars(
        select(User)
        .where(*filters)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_admin_user_out(db, user) for user in users],
        page=page,
        page_size=page_size,
        total=total,
    )


def get_user_detail(db: Session, user_id: str) -> AdminUserOut:
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在。")
    return to_admin_user_out(db, user)


def update_user_status(db: Session, user_id: str, payload: UserStatusUpdate) -> AdminUserOut:
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在。")
    user.status = payload.status
    db.commit()
    db.refresh(user)
    return to_admin_user_out(db, user)


def to_review_post_out(post: CommunityPost) -> CommunityPostOut:
    return CommunityPostOut(
        id=post.id,
        author=CommunityAuthor(id=post.author.id, username=post.author.username),
        title=post.title,
        content=post.content,
        tag=post.tag,
        status=post.status,
        review_reason=post.review_reason,
        view_count=post.view_count,
        like_count=post.like_count,
        comment_count=post.comment_count,
        report_count=post.report_count,
        is_liked=False,
        is_bookmarked=False,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def to_review_comment_out(comment: CommunityComment) -> CommunityCommentOut:
    return CommunityCommentOut(
        id=comment.id,
        post_id=comment.post_id,
        author=CommunityAuthor(id=comment.author.id, username=comment.author.username),
        content=comment.content,
        status=comment.status,
        review_reason=comment.review_reason,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


def list_review_posts(db: Session, status_filter: str | None, page: int, page_size: int) -> PagedResponse[CommunityPostOut]:
    filters = []
    if status_filter:
        filters.append(CommunityPost.status == status_filter)
    total = db.scalar(select(func.count(CommunityPost.id)).where(*filters)) or 0
    posts = db.scalars(
        select(CommunityPost)
        .where(*filters)
        .options(selectinload(CommunityPost.author))
        .order_by(CommunityPost.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(items=[to_review_post_out(post) for post in posts], page=page, page_size=page_size, total=total)


def update_review_post(db: Session, post_id: str, payload: AdminReviewUpdate) -> CommunityPostOut:
    post = db.scalar(
        select(CommunityPost).where(CommunityPost.id == post_id).options(selectinload(CommunityPost.author))
    )
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="帖子不存在。")
    post.status = payload.status
    post.review_reason = payload.reason
    db.commit()
    db.refresh(post)
    db.refresh(post, attribute_names=["author"])
    return to_review_post_out(post)


def list_review_comments(db: Session, status_filter: str | None, page: int, page_size: int) -> PagedResponse[CommunityCommentOut]:
    filters = []
    if status_filter:
        filters.append(CommunityComment.status == status_filter)
    total = db.scalar(select(func.count(CommunityComment.id)).where(*filters)) or 0
    comments = db.scalars(
        select(CommunityComment)
        .where(*filters)
        .options(selectinload(CommunityComment.author))
        .order_by(CommunityComment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_review_comment_out(comment) for comment in comments],
        page=page,
        page_size=page_size,
        total=total,
    )


def update_review_comment(db: Session, comment_id: str, payload: AdminReviewUpdate) -> CommunityCommentOut:
    comment = db.scalar(
        select(CommunityComment).where(CommunityComment.id == comment_id).options(selectinload(CommunityComment.author))
    )
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="评论不存在。")
    comment.status = payload.status
    comment.review_reason = payload.reason
    recount_post_comments(db, comment.post_id)
    db.commit()
    db.refresh(comment)
    db.refresh(comment, attribute_names=["author"])
    return to_review_comment_out(comment)


def to_admin_article_out(article: KnowledgeArticle) -> AdminKnowledgeArticleOut:
    return AdminKnowledgeArticleOut(
        id=article.id,
        category_id=article.category_id,
        category_name=article.category.name if article.category else "",
        title=article.title,
        summary=article.summary,
        content=article.content,
        article_type=article.article_type,
        author_name=article.author_name,
        author_title=article.author_title,
        source=article.source,
        read_time_minutes=article.read_time_minutes,
        cover_color=article.cover_color,
        status=article.status,
        view_count=article.view_count,
        like_count=article.like_count,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
    )


def list_admin_articles(db: Session, status_filter: str | None, page: int, page_size: int) -> PagedResponse[AdminKnowledgeArticleOut]:
    filters = []
    if status_filter:
        filters.append(KnowledgeArticle.status == status_filter)
    total = db.scalar(select(func.count(KnowledgeArticle.id)).where(*filters)) or 0
    articles = db.scalars(
        select(KnowledgeArticle)
        .where(*filters)
        .options(selectinload(KnowledgeArticle.category))
        .order_by(KnowledgeArticle.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_admin_article_out(article) for article in articles],
        page=page,
        page_size=page_size,
        total=total,
    )


def ensure_category(db: Session, category_id: str) -> KnowledgeCategory:
    category = db.scalar(select(KnowledgeCategory).where(KnowledgeCategory.id == category_id))
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识分类不存在。")
    return category


def create_admin_article(db: Session, payload: AdminKnowledgeArticleCreate) -> AdminKnowledgeArticleOut:
    ensure_category(db, payload.category_id)
    article = KnowledgeArticle(
        category_id=payload.category_id,
        title=payload.title,
        summary=payload.summary,
        content=payload.content,
        article_type=payload.article_type,
        author_name=payload.author_name,
        author_title=payload.author_title,
        source=payload.source,
        read_time_minutes=payload.read_time_minutes,
        cover_color=payload.cover_color,
        status=payload.status,
        published_at=utc_now(),
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    db.refresh(article, attribute_names=["category"])
    return to_admin_article_out(article)


def update_admin_article(db: Session, article_id: str, payload: AdminKnowledgeArticleUpdate) -> AdminKnowledgeArticleOut:
    article = db.scalar(
        select(KnowledgeArticle).where(KnowledgeArticle.id == article_id).options(selectinload(KnowledgeArticle.category))
    )
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识文章不存在。")
    ensure_category(db, payload.category_id)
    article.category_id = payload.category_id
    article.title = payload.title
    article.summary = payload.summary
    article.content = payload.content
    article.article_type = payload.article_type
    article.author_name = payload.author_name
    article.author_title = payload.author_title
    article.source = payload.source
    article.read_time_minutes = payload.read_time_minutes
    article.cover_color = payload.cover_color
    article.status = payload.status
    db.commit()
    db.refresh(article)
    db.refresh(article, attribute_names=["category"])
    return to_admin_article_out(article)


def update_admin_article_status(
    db: Session,
    article_id: str,
    payload: AdminKnowledgeArticleStatusUpdate,
) -> AdminKnowledgeArticleOut:
    article = db.scalar(
        select(KnowledgeArticle).where(KnowledgeArticle.id == article_id).options(selectinload(KnowledgeArticle.category))
    )
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识文章不存在。")
    article.status = payload.status
    db.commit()
    db.refresh(article)
    db.refresh(article, attribute_names=["category"])
    return to_admin_article_out(article)


def to_ai_log_out(log: AiAssistantLog) -> AdminAiLogOut:
    return AdminAiLogOut(
        id=log.id,
        user_id=log.user_id,
        username=log.user.username if log.user else "",
        message=log.message,
        intent=log.intent,
        answer_text=log.answer_text,
        draft_type=log.draft_type,
        draft_payload=log.draft_payload,
        sources=log.sources,
        risk_note=log.risk_note,
        created_at=log.created_at,
    )


def list_ai_logs(db: Session, intent: str | None, page: int, page_size: int) -> PagedResponse[AdminAiLogOut]:
    filters = []
    if intent:
        filters.append(AiAssistantLog.intent == intent)
    total = db.scalar(select(func.count(AiAssistantLog.id)).where(*filters)) or 0
    logs = db.scalars(
        select(AiAssistantLog)
        .where(*filters)
        .options(selectinload(AiAssistantLog.user))
        .order_by(AiAssistantLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(items=[to_ai_log_out(log) for log in logs], page=page, page_size=page_size, total=total)


def get_ai_log(db: Session, log_id: str) -> AdminAiLogOut:
    log = db.scalar(
        select(AiAssistantLog).where(AiAssistantLog.id == log_id).options(selectinload(AiAssistantLog.user))
    )
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI 日志不存在。")
    return to_ai_log_out(log)
