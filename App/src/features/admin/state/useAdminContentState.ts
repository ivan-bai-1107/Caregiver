import { useEffect, useMemo, useState } from "react";
import type { KnowledgeCategory } from "@/features/knowledge/model";
import type {
  AdminArticleStatus,
  AdminKnowledgeArticle,
  AdminKnowledgeArticleDraft,
} from "@/features/admin/model";
import { createEmptyArticleDraft } from "@/features/admin/model";
import {
  createAdminKnowledgeArticle,
  listAdminKnowledgeCategories,
  listAdminKnowledgeArticles,
  updateAdminKnowledgeArticle,
  updateAdminKnowledgeArticleStatus,
} from "@/features/admin/services/admin.service";

export function useAdminContentState() {
  const [articles, setArticles] = useState<AdminKnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [status, setStatus] = useState<"all" | AdminArticleStatus>("all");
  const [keyword, setKeyword] = useState("");
  const [editingArticle, setEditingArticle] = useState<AdminKnowledgeArticle | null>(null);
  const [draft, setDraft] = useState<AdminKnowledgeArticleDraft>(createEmptyArticleDraft());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadContent() {
    setIsLoading(true);
    setError(null);
    try {
      const [articleResponse, nextCategories] = await Promise.all([
        listAdminKnowledgeArticles({ status: status === "all" ? undefined : status, page: 1, pageSize: 50 }),
        listAdminKnowledgeCategories(),
      ]);
      setArticles(articleResponse.items ?? []);
      setCategories(nextCategories);
    } catch {
      setError("知识内容加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContent();
  }, [status]);

  function openCreate() {
    setEditingArticle(null);
    setDraft(createEmptyArticleDraft(categories[0]?.id ?? ""));
    setIsEditorOpen(true);
  }

  function openEdit(article: AdminKnowledgeArticle) {
    setEditingArticle(article);
    setDraft({
      categoryId: article.categoryId,
      title: article.title,
      summary: article.summary,
      content: article.content,
      articleType: article.articleType,
      authorName: article.authorName,
      authorTitle: article.authorTitle,
      source: article.source,
      videoUrl: article.videoUrl,
      readTimeMinutes: article.readTimeMinutes,
      coverColor: article.coverColor,
      status: article.status,
    });
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setEditingArticle(null);
  }

  function updateDraft<K extends keyof AdminKnowledgeArticleDraft>(field: K, value: AdminKnowledgeArticleDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveArticle() {
    setIsMutating(true);
    try {
      if (editingArticle) {
        await updateAdminKnowledgeArticle(editingArticle.id, draft);
      } else {
        await createAdminKnowledgeArticle(draft);
      }
      closeEditor();
      await loadContent();
      return true;
    } finally {
      setIsMutating(false);
    }
  }

  async function setArticleStatus(article: AdminKnowledgeArticle, nextStatus: AdminArticleStatus) {
    setIsMutating(true);
    try {
      await updateAdminKnowledgeArticleStatus(article.id, nextStatus);
      await loadContent();
    } finally {
      setIsMutating(false);
    }
  }

  const filteredArticles = useMemo(() => {
    const value = keyword.trim();
    if (!value) {
      return articles;
    }
    return articles.filter(
      (article) =>
        article.title.includes(value) ||
        article.authorName.includes(value) ||
        article.categoryName.includes(value),
    );
  }, [articles, keyword]);

  return {
    articles: filteredArticles,
    categories,
    status,
    keyword,
    editingArticle,
    draft,
    isEditorOpen,
    isLoading,
    isMutating,
    error,
    setStatus,
    setKeyword,
    openCreate,
    openEdit,
    closeEditor,
    updateDraft,
    saveArticle,
    setArticleStatus,
    retry: loadContent,
  };
}
