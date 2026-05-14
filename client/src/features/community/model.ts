export type CommunityReviewStatus = "pending" | "passed" | "rejected";

export interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface CommunityAuthor {
  id: string;
  username: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  title: string;
  content: string;
  tag: string;
  status: CommunityReviewStatus;
  reviewReason: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  reportCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  author: CommunityAuthor;
  content: string;
  status: CommunityReviewStatus;
  reviewReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostActionState {
  postId: string;
  likeCount: number;
  commentCount: number;
  reportCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface CommunityPostQuery {
  q?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface CommunityPostDraft {
  title: string;
  content: string;
  tag: string;
}

export const communityTagOptions = [
  { value: "", label: "全部" },
  { value: "experience", label: "经验分享" },
  { value: "tools", label: "工具分享" },
  { value: "question", label: "护理疑问" },
  { value: "discussion", label: "交流讨论" },
] as const;

export function getCommunityTagLabel(tag: string) {
  return communityTagOptions.find((option) => option.value === tag)?.label ?? tag;
}

export function getCommunityStatusLabel(status: CommunityReviewStatus) {
  switch (status) {
    case "passed":
      return "已通过";
    case "rejected":
      return "已拒绝";
    default:
      return "待审核";
  }
}
