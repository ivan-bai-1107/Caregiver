import type { CommunityPost, CommunityReviewStatus } from "@/features/community/model";

export type AdminUserStatus = "active" | "disabled";
export type AdminArticleStatus = "published" | "draft" | "archived";
export type AdminKnowledgeArticleType = "article" | "video";
export type AdminPromptStatus = "active" | "disabled";

export interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface AdminLoginResponse {
  token: string;
}

export interface AdminMe {
  id: string;
  username: string;
  email: string;
}

export interface AdminDashboardSummary {
  userCount: number;
  patientCount: number;
  recordCount: number;
  taskCount: number;
  pendingPostCount: number;
  pendingCommentCount: number;
  knowledgeArticleCount: number;
  aiLogCount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  status: AdminUserStatus;
  patientCount: number;
  createdAt: string;
}

export interface AdminKnowledgeArticleDraft {
  categoryId: string;
  title: string;
  summary: string;
  content: string;
  articleType: AdminKnowledgeArticleType;
  authorName: string;
  authorTitle: string;
  source: string;
  videoUrl: string;
  readTimeMinutes: number;
  coverColor: string;
  status: AdminArticleStatus;
}

export interface AdminKnowledgeArticle extends AdminKnowledgeArticleDraft {
  id: string;
  categoryName: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiLog {
  id: string;
  userId: string;
  username: string;
  message: string;
  intent: string;
  answerText: string;
  draftType: string | null;
  draftPayload: Record<string, unknown> | null;
  sources: string[];
  riskNote: string;
  createdAt: string;
}

export interface AdminPromptTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  content: string;
  status: AdminPromptStatus;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPromptTemplateDraft {
  name: string;
  description: string;
  content: string;
  status: AdminPromptStatus;
}

export type AdminReviewItem = { type: "post"; item: CommunityPost };

export interface AdminReviewUpdatePayload {
  status: CommunityReviewStatus;
  reason?: string;
}

export const adminArticleStatusLabels: Record<AdminArticleStatus, string> = {
  published: "已上架",
  draft: "草稿",
  archived: "已下架",
};

export const adminUserStatusLabels: Record<AdminUserStatus, string> = {
  active: "正常",
  disabled: "已禁用",
};

export const adminReviewStatusLabels: Record<CommunityReviewStatus, string> = {
  pending: "待审核",
  passed: "已通过",
  rejected: "已拒绝",
};

export const adminPromptStatusLabels: Record<AdminPromptStatus, string> = {
  active: "启用",
  disabled: "停用",
};

export function createEmptyArticleDraft(categoryId = ""): AdminKnowledgeArticleDraft {
  return {
    categoryId,
    title: "",
    summary: "",
    content: "",
    articleType: "article",
    authorName: "护理知识编辑",
    authorTitle: "护理内容团队",
    source: "系统知识库",
    videoUrl: "",
    readTimeMinutes: 5,
    coverColor: "primary",
    status: "draft",
  };
}
