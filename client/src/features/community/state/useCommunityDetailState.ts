import { useEffect, useMemo, useState } from "react";
import type { CommunityComment, CommunityPost, CommunityPostActionState } from "@/features/community/model";
import {
  bookmarkCommunityPost,
  createCommunityComment,
  getCommunityAuthorPosts,
  getCommunityPost,
  getRelatedCommunityPosts,
  likeCommunityPost,
  listCommunityComments,
  removeCommunityPostBookmark,
  reportCommunityPost,
} from "@/features/community/services/community.service";

function applyActionState(post: CommunityPost, state: CommunityPostActionState): CommunityPost {
  return {
    ...post,
    likeCount: state.likeCount,
    commentCount: state.commentCount,
    reportCount: state.reportCount,
    isLiked: state.isLiked,
    isBookmarked: state.isBookmarked,
  };
}

export function useCommunityDetailState(postId?: string) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<CommunityPost[]>([]);
  const [authorPosts, setAuthorPosts] = useState<CommunityPost[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPost() {
    if (!postId) {
      setError("帖子不存在。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const nextPost = await getCommunityPost(postId);
      const [nextComments, nextRelatedPosts, nextAuthorPosts] = await Promise.all([
        listCommunityComments(postId),
        getRelatedCommunityPosts(postId),
        getCommunityAuthorPosts(nextPost.author.id),
      ]);

      setPost(nextPost);
      setComments(nextComments);
      setRelatedPosts(nextRelatedPosts);
      setAuthorPosts(nextAuthorPosts.filter((item) => item.id !== nextPost.id));
    } catch {
      setError("帖子详情加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPost();
  }, [postId]);

  async function like() {
    if (!post || post.isLiked) {
      return;
    }
    setIsMutating(true);
    try {
      const state = await likeCommunityPost(post.id);
      setPost((current) => (current ? applyActionState(current, state) : current));
    } finally {
      setIsMutating(false);
    }
  }

  async function toggleBookmark() {
    if (!post) {
      return;
    }
    setIsMutating(true);
    try {
      const state = post.isBookmarked
        ? await removeCommunityPostBookmark(post.id)
        : await bookmarkCommunityPost(post.id);
      setPost((current) => (current ? applyActionState(current, state) : current));
    } finally {
      setIsMutating(false);
    }
  }

  async function report(reason?: string) {
    if (!post) {
      return;
    }
    setIsMutating(true);
    try {
      const state = await reportCommunityPost(post.id, reason);
      setPost((current) => (current ? applyActionState(current, state) : current));
    } finally {
      setIsMutating(false);
    }
  }

  async function submitComment() {
    if (!post || !commentText.trim()) {
      return null;
    }
    setIsMutating(true);
    try {
      const comment = await createCommunityComment(post.id, commentText);
      setComments((current) => [...current, comment]);
      setCommentText("");
      return comment;
    } finally {
      setIsMutating(false);
    }
  }

  const visibleCommentCount = useMemo(() => comments.length, [comments]);

  return {
    post,
    comments,
    relatedPosts,
    authorPosts,
    commentText,
    visibleCommentCount,
    isLoading,
    isMutating,
    error,
    setCommentText,
    retry: loadPost,
    like,
    toggleBookmark,
    report,
    submitComment,
  };
}
