import { useEffect, useState } from "react";
import type {
  KnowledgeArticleActionState,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
} from "@/features/knowledge/model";
import {
  bookmarkKnowledgeArticle,
  getKnowledgeArticle,
  getRelatedKnowledgeArticles,
  likeKnowledgeArticle,
  recordKnowledgeArticleView,
  removeKnowledgeArticleLike,
  removeKnowledgeArticleBookmark,
} from "@/features/knowledge/services/knowledge.service";

function applyActionState(
  article: KnowledgeArticleDetail,
  state: KnowledgeArticleActionState,
): KnowledgeArticleDetail {
  return {
    ...article,
    viewCount: state.viewCount,
    likeCount: state.likeCount,
    isLiked: state.isLiked,
    isBookmarked: state.isBookmarked,
  };
}

export function useKnowledgeDetailState(articleId: string | undefined) {
  const [article, setArticle] = useState<KnowledgeArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<KnowledgeArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  async function loadArticle() {
    if (!articleId) {
      setError("文章不存在。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [nextArticle, nextRelated] = await Promise.all([
        getKnowledgeArticle(articleId),
        getRelatedKnowledgeArticles(articleId),
      ]);
      setArticle(nextArticle);
      setRelatedArticles(nextRelated);

      const viewState = await recordKnowledgeArticleView(articleId);
      setArticle((current) => (current ? applyActionState(current, viewState) : current));
    } catch {
      setError("知识文章加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadArticle();
  }, [articleId]);

  async function like() {
    if (!article || isMutating) {
      return;
    }

    setIsMutating(true);
    try {
      const state = article.isLiked
        ? await removeKnowledgeArticleLike(article.id)
        : await likeKnowledgeArticle(article.id);
      setArticle((current) => (current ? applyActionState(current, state) : current));
    } finally {
      setIsMutating(false);
    }
  }

  async function toggleBookmark() {
    if (!article || isMutating) {
      return;
    }

    setIsMutating(true);
    try {
      const state = article.isBookmarked
        ? await removeKnowledgeArticleBookmark(article.id)
        : await bookmarkKnowledgeArticle(article.id);
      setArticle((current) => (current ? applyActionState(current, state) : current));
    } finally {
      setIsMutating(false);
    }
  }

  return {
    article,
    relatedArticles,
    isLoading,
    isMutating,
    error,
    retry: loadArticle,
    like,
    toggleBookmark,
  };
}
