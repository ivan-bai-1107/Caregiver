import { apiClient } from "@/shared/lib/apiClient";
import type {
  AdminAiLog,
  AdminArticleStatus,
  AdminDashboardSummary,
  AdminKnowledgeArticle,
  AdminKnowledgeArticleDraft,
  AdminLoginResponse,
  AdminMe,
  AdminPromptTemplate,
  AdminPromptTemplateDraft,
  AdminReviewUpdatePayload,
  AdminUser,
  AdminUserStatus,
  PagedResponse,
} from "@admin/model";
import type { CommunityPost, CommunityReviewStatus } from "@/features/community/model";
import type { KnowledgeCategory } from "@/features/knowledge/model";

export const ADMIN_TOKEN_STORAGE_KEY = "care-app-admin-token";

export function getAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function adminOptions() {
  const token = getAdminToken();
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;
}

export async function loginAdmin(email: string, password: string) {
  const response = await apiClient.post<AdminLoginResponse>("/api/admin/auth/login", { email, password });
  setAdminToken(response.token);
  return response;
}

export async function getAdminMe() {
  return apiClient.get<AdminMe>("/api/admin/me", undefined, adminOptions());
}

export async function getAdminDashboardSummary() {
  return apiClient.get<AdminDashboardSummary>("/api/admin/dashboard/summary", undefined, adminOptions());
}

export async function listAdminUsers(params: { keyword?: string; page?: number; pageSize?: number } = {}) {
  return apiClient.get<PagedResponse<AdminUser>>("/api/admin/users", params, adminOptions());
}

export async function updateAdminUserStatus(userId: string, status: AdminUserStatus) {
  return apiClient.put<AdminUser>(`/api/admin/users/${userId}/status`, { status }, adminOptions());
}

export async function listAdminReviewPosts(
  params: { status?: CommunityReviewStatus; page?: number; pageSize?: number } = {},
) {
  return apiClient.get<PagedResponse<CommunityPost>>("/api/admin/reviews/posts", params, adminOptions());
}

export async function updateAdminReviewPost(postId: string, payload: AdminReviewUpdatePayload) {
  return apiClient.put<CommunityPost>(`/api/admin/reviews/posts/${postId}`, payload, adminOptions());
}

export async function listAdminKnowledgeArticles(
  params: { status?: AdminArticleStatus; page?: number; pageSize?: number } = {},
) {
  return apiClient.get<PagedResponse<AdminKnowledgeArticle>>(
    "/api/admin/knowledge/articles",
    params,
    adminOptions(),
  );
}

export async function listAdminKnowledgeCategories() {
  return apiClient.get<KnowledgeCategory[]>("/api/admin/knowledge/categories", undefined, adminOptions());
}

export async function createAdminKnowledgeArticle(draft: AdminKnowledgeArticleDraft) {
  return apiClient.post<AdminKnowledgeArticle>("/api/admin/knowledge/articles", draft, adminOptions());
}

export async function updateAdminKnowledgeArticle(articleId: string, draft: AdminKnowledgeArticleDraft) {
  return apiClient.put<AdminKnowledgeArticle>(`/api/admin/knowledge/articles/${articleId}`, draft, adminOptions());
}

export async function updateAdminKnowledgeArticleStatus(articleId: string, status: AdminArticleStatus) {
  return apiClient.put<AdminKnowledgeArticle>(
    `/api/admin/knowledge/articles/${articleId}/status`,
    { status },
    adminOptions(),
  );
}

export async function listAdminPrompts() {
  return apiClient.get<AdminPromptTemplate[]>("/api/admin/prompts", undefined, adminOptions());
}

export async function updateAdminPrompt(promptId: string, draft: AdminPromptTemplateDraft) {
  return apiClient.put<AdminPromptTemplate>(`/api/admin/prompts/${promptId}`, draft, adminOptions());
}

export async function listAdminAiLogs(params: { intent?: string; page?: number; pageSize?: number } = {}) {
  return apiClient.get<PagedResponse<AdminAiLog>>("/api/admin/ai-logs", params, adminOptions());
}

export async function getAdminAiLog(logId: string) {
  return apiClient.get<AdminAiLog>(`/api/admin/ai-logs/${logId}`, undefined, adminOptions());
}
