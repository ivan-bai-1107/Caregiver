import { apiClient } from "@/shared/lib/apiClient";
import type {
  KnowledgeArticleActionState,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
  KnowledgeArticleQuery,
  KnowledgeCategory,
} from "@/features/knowledge/model";

interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

export async function listKnowledgeCategories() {
  return apiClient.get<KnowledgeCategory[]>("/api/knowledge/categories");
}

export async function listKnowledgeArticles(query: KnowledgeArticleQuery = {}) {
  return apiClient.get<PagedResponse<KnowledgeArticleListItem>>("/api/knowledge/articles", query);
}

export async function getKnowledgeArticle(articleId: string) {
  return apiClient.get<KnowledgeArticleDetail>(`/api/knowledge/articles/${articleId}`);
}

export async function getRelatedKnowledgeArticles(articleId: string) {
  return apiClient.get<KnowledgeArticleListItem[]>(`/api/knowledge/articles/${articleId}/related`);
}

export async function recordKnowledgeArticleView(articleId: string) {
  return apiClient.post<KnowledgeArticleActionState>(`/api/knowledge/articles/${articleId}/view`, {});
}

export async function likeKnowledgeArticle(articleId: string) {
  return apiClient.post<KnowledgeArticleActionState>(`/api/knowledge/articles/${articleId}/like`, {});
}

export async function bookmarkKnowledgeArticle(articleId: string) {
  return apiClient.post<KnowledgeArticleActionState>(`/api/knowledge/articles/${articleId}/bookmark`, {});
}

export async function removeKnowledgeArticleBookmark(articleId: string) {
  return apiClient.delete<KnowledgeArticleActionState>(`/api/knowledge/articles/${articleId}/bookmark`);
}
