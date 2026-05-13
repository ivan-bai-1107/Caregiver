export type KnowledgeArticleType = "article" | "video";

export interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface KnowledgeArticleListItem {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  summary: string;
  articleType: KnowledgeArticleType;
  authorName: string;
  authorTitle: string;
  source: string;
  readTimeMinutes: number;
  coverColor: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  publishedAt: string;
}

export interface KnowledgeArticleDetail extends KnowledgeArticleListItem {
  content: string;
}

export interface KnowledgeArticleActionState {
  articleId: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface KnowledgeArticleQuery {
  q?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}
