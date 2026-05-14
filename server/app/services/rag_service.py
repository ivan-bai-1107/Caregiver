from __future__ import annotations

import re
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.knowledge import KnowledgeArticle


MEDICAL_KEYWORDS = (
    "高血压",
    "血压",
    "糖尿病",
    "血糖",
    "体温",
    "发热",
    "心率",
    "用药",
    "服药",
    "饮食",
    "营养",
    "康复",
    "压疮",
    "护理",
    "起夜",
    "复健",
)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("#", " ")).strip()


def extract_keywords(message: str) -> list[str]:
    keywords: list[str] = []
    for keyword in MEDICAL_KEYWORDS:
        if keyword in message:
            keywords.append(keyword)

    for token in re.findall(r"[\u4e00-\u9fff]{2,}|[A-Za-z0-9_]{3,}", message):
        if token not in keywords:
            keywords.append(token)

    return keywords[:12]


def article_score(article: KnowledgeArticle, keywords: list[str]) -> int:
    title = article.title.lower()
    summary = article.summary.lower()
    content = article.content.lower()
    score = 0

    for raw_keyword in keywords:
        keyword = raw_keyword.lower()
        if keyword in title:
            score += 8
        if keyword in summary:
            score += 4
        if keyword in content:
            score += 2

    return score


def build_snippet(article: KnowledgeArticle, keywords: list[str], max_length: int = 220) -> str:
    text = normalize_text(f"{article.summary} {article.content}")
    if not text:
        return ""

    first_match = min(
        (text.find(keyword) for keyword in keywords if keyword and text.find(keyword) >= 0),
        default=0,
    )
    start = max(first_match - 40, 0)
    snippet = text[start:start + max_length].strip()
    if start > 0:
        snippet = f"...{snippet}"
    if start + max_length < len(text):
        snippet = f"{snippet}..."
    return snippet


def retrieve_knowledge_context(db: Session, message: str, limit: int = 4) -> list[dict[str, Any]]:
    keywords = extract_keywords(message)
    if not keywords:
        return []

    articles = db.scalars(
        select(KnowledgeArticle)
        .where(KnowledgeArticle.status == "published")
        .options(selectinload(KnowledgeArticle.category))
        .order_by(KnowledgeArticle.published_at.desc(), KnowledgeArticle.updated_at.desc())
        .limit(120)
    ).all()

    ranked = sorted(
        ((article_score(article, keywords), article) for article in articles),
        key=lambda item: item[0],
        reverse=True,
    )

    context: list[dict[str, Any]] = []
    for score, article in ranked:
        if score <= 0:
            continue
        snippet = build_snippet(article, keywords)
        if not snippet:
            continue
        context.append(
            {
                "articleId": article.id,
                "title": article.title,
                "category": article.category.name if article.category else "",
                "source": article.source,
                "snippet": snippet,
            }
        )
        if len(context) >= limit:
            break

    return context


def knowledge_source_labels(context: list[dict[str, Any]]) -> list[str]:
    labels: list[str] = []
    for item in context:
        title = str(item.get("title") or "").strip()
        if title and title not in labels:
            labels.append(title)
    return labels
