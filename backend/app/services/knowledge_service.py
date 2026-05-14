from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from fastapi import HTTPException, status

from app.models.knowledge import (
    KnowledgeArticle,
    KnowledgeCategory,
    UserKnowledgeBookmark,
    UserKnowledgeLike,
)
from app.models.user import User
from app.schemas.base import PagedResponse
from app.schemas.knowledge import (
    KnowledgeArticleActionState,
    KnowledgeArticleDetail,
    KnowledgeArticleListItem,
    KnowledgeCategoryOut,
)


def list_categories(db: Session) -> list[KnowledgeCategoryOut]:
    categories = db.scalars(
        select(KnowledgeCategory).order_by(KnowledgeCategory.sort_order.asc(), KnowledgeCategory.name.asc())
    ).all()
    return [
        KnowledgeCategoryOut(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            sort_order=category.sort_order,
        )
        for category in categories
    ]


def user_article_state(db: Session, user: User, article_id: str) -> tuple[bool, bool]:
    is_liked = (
        db.scalar(
            select(UserKnowledgeLike.id).where(
                UserKnowledgeLike.user_id == user.id,
                UserKnowledgeLike.article_id == article_id,
            )
        )
        is not None
    )
    is_bookmarked = (
        db.scalar(
            select(UserKnowledgeBookmark.id).where(
                UserKnowledgeBookmark.user_id == user.id,
                UserKnowledgeBookmark.article_id == article_id,
            )
        )
        is not None
    )
    return is_liked, is_bookmarked


def to_article_list_item(article: KnowledgeArticle, user: User, db: Session) -> KnowledgeArticleListItem:
    is_liked, is_bookmarked = user_article_state(db, user, article.id)
    return KnowledgeArticleListItem(
        id=article.id,
        category_id=article.category_id,
        category_name=article.category.name if article.category else "",
        title=article.title,
        summary=article.summary,
        article_type=article.article_type,
        author_name=article.author_name,
        author_title=article.author_title,
        source=article.source,
        video_url=article.video_url,
        read_time_minutes=article.read_time_minutes,
        cover_color=article.cover_color,
        view_count=article.view_count,
        like_count=article.like_count,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
        published_at=article.published_at,
    )


def to_article_detail(article: KnowledgeArticle, user: User, db: Session) -> KnowledgeArticleDetail:
    item = to_article_list_item(article, user, db)
    return KnowledgeArticleDetail(**item.model_dump(), content=article.content)


def get_article_or_404(db: Session, article_id: str) -> KnowledgeArticle:
    article = db.scalar(
        select(KnowledgeArticle)
        .where(KnowledgeArticle.id == article_id, KnowledgeArticle.status == "published")
        .options(selectinload(KnowledgeArticle.category))
    )
    if article is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识文章不存在。")
    return article


def list_articles(
    db: Session,
    user: User,
    q: str | None = None,
    category_id: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> PagedResponse[KnowledgeArticleListItem]:
    filters = [KnowledgeArticle.status == "published"]
    keyword = q.strip() if q else ""
    if keyword:
        filters.append(
            or_(
                KnowledgeArticle.title.ilike(f"%{keyword}%"),
                KnowledgeArticle.summary.ilike(f"%{keyword}%"),
                KnowledgeArticle.content.ilike(f"%{keyword}%"),
            )
        )
    if category_id:
        filters.append(KnowledgeArticle.category_id == category_id)

    total = db.scalar(select(func.count(KnowledgeArticle.id)).where(*filters)) or 0
    articles = db.scalars(
        select(KnowledgeArticle)
        .where(*filters)
        .options(selectinload(KnowledgeArticle.category))
        .order_by(KnowledgeArticle.published_at.desc(), KnowledgeArticle.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return PagedResponse(
        items=[to_article_list_item(article, user, db) for article in articles],
        page=page,
        page_size=page_size,
        total=total,
    )


def get_article_detail(db: Session, user: User, article_id: str) -> KnowledgeArticleDetail:
    return to_article_detail(get_article_or_404(db, article_id), user, db)


def get_related_articles(db: Session, user: User, article_id: str) -> list[KnowledgeArticleListItem]:
    article = get_article_or_404(db, article_id)
    related = db.scalars(
        select(KnowledgeArticle)
        .where(
            KnowledgeArticle.id != article.id,
            KnowledgeArticle.category_id == article.category_id,
            KnowledgeArticle.status == "published",
        )
        .options(selectinload(KnowledgeArticle.category))
        .order_by(KnowledgeArticle.published_at.desc())
        .limit(3)
    ).all()
    if len(related) < 3:
        extra = db.scalars(
            select(KnowledgeArticle)
            .where(
                KnowledgeArticle.id != article.id,
                KnowledgeArticle.category_id != article.category_id,
                KnowledgeArticle.status == "published",
            )
            .options(selectinload(KnowledgeArticle.category))
            .order_by(KnowledgeArticle.published_at.desc())
            .limit(3 - len(related))
        ).all()
        related = [*related, *extra]
    return [to_article_list_item(item, user, db) for item in related]


def to_action_state(db: Session, user: User, article: KnowledgeArticle) -> KnowledgeArticleActionState:
    is_liked, is_bookmarked = user_article_state(db, user, article.id)
    return KnowledgeArticleActionState(
        article_id=article.id,
        view_count=article.view_count,
        like_count=article.like_count,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
    )


def increment_article_view(db: Session, user: User, article_id: str) -> KnowledgeArticleActionState:
    article = get_article_or_404(db, article_id)
    article.view_count += 1
    db.commit()
    db.refresh(article)
    return to_action_state(db, user, article)


def like_article(db: Session, user: User, article_id: str) -> KnowledgeArticleActionState:
    article = get_article_or_404(db, article_id)
    existing = db.scalar(
        select(UserKnowledgeLike).where(
            UserKnowledgeLike.user_id == user.id,
            UserKnowledgeLike.article_id == article.id,
        )
    )
    if existing is None:
        db.add(UserKnowledgeLike(user_id=user.id, article_id=article.id))
        article.like_count += 1
        db.commit()
        db.refresh(article)
    return to_action_state(db, user, article)


def bookmark_article(db: Session, user: User, article_id: str) -> KnowledgeArticleActionState:
    article = get_article_or_404(db, article_id)
    existing = db.scalar(
        select(UserKnowledgeBookmark).where(
            UserKnowledgeBookmark.user_id == user.id,
            UserKnowledgeBookmark.article_id == article.id,
        )
    )
    if existing is None:
        db.add(UserKnowledgeBookmark(user_id=user.id, article_id=article.id))
        db.commit()
    return to_action_state(db, user, article)


def remove_article_bookmark(db: Session, user: User, article_id: str) -> KnowledgeArticleActionState:
    article = get_article_or_404(db, article_id)
    existing = db.scalar(
        select(UserKnowledgeBookmark).where(
            UserKnowledgeBookmark.user_id == user.id,
            UserKnowledgeBookmark.article_id == article.id,
        )
    )
    if existing is not None:
        db.delete(existing)
        db.commit()
    return to_action_state(db, user, article)
