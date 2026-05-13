import { apiClient } from "@/shared/lib/apiClient";
import type {
  CommunityComment,
  CommunityPost,
  CommunityPostActionState,
  CommunityPostDraft,
  CommunityPostQuery,
  PagedResponse,
} from "@/features/community/model";

export async function listCommunityPosts(query: CommunityPostQuery = {}) {
  return apiClient.get<PagedResponse<CommunityPost>>("/api/community/posts", query);
}

export async function getCommunityPost(postId: string) {
  return apiClient.get<CommunityPost>(`/api/community/posts/${postId}`);
}

export async function createCommunityPost(draft: CommunityPostDraft) {
  return apiClient.post<CommunityPost>("/api/community/posts", {
    title: draft.title.trim(),
    content: draft.content.trim(),
    tag: draft.tag,
  });
}

export async function listCommunityComments(postId: string) {
  return apiClient.get<CommunityComment[]>(`/api/community/posts/${postId}/comments`);
}

export async function createCommunityComment(postId: string, content: string) {
  return apiClient.post<CommunityComment>(`/api/community/posts/${postId}/comments`, {
    content: content.trim(),
  });
}

export async function likeCommunityPost(postId: string) {
  return apiClient.post<CommunityPostActionState>(`/api/community/posts/${postId}/like`, {});
}

export async function bookmarkCommunityPost(postId: string) {
  return apiClient.post<CommunityPostActionState>(`/api/community/posts/${postId}/bookmark`, {});
}

export async function removeCommunityPostBookmark(postId: string) {
  return apiClient.delete<CommunityPostActionState>(`/api/community/posts/${postId}/bookmark`);
}

export async function reportCommunityPost(postId: string, reason = "用户举报") {
  return apiClient.post<CommunityPostActionState>(`/api/community/posts/${postId}/report`, { reason });
}

export async function getRelatedCommunityPosts(postId: string) {
  return apiClient.get<CommunityPost[]>(`/api/community/posts/${postId}/related`);
}

export async function getCommunityAuthorPosts(authorId: string) {
  return apiClient.get<CommunityPost[]>(`/api/community/users/${authorId}/posts`);
}
