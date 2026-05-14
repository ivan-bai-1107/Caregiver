import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Flag,
  MessageCircle,
  Share2,
  ThumbsUp,
  User,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { getCommunityStatusLabel, getCommunityTagLabel } from "@/features/community/model";
import { useCommunityDetailState } from "@/features/community/state/useCommunityDetailState";
import { formatDateTimeLabel } from "@/shared/lib/date";
import { isShareCancelled, shareCurrentPage } from "@/shared/lib/share";

function statusClass(status: string) {
  if (status === "passed") {
    return "bg-primary/10 text-primary";
  }
  if (status === "rejected") {
    return "bg-accent/10 text-accent";
  }
  return "bg-chart-4/20 text-accent";
}

export function CommunityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
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
    retry,
    like,
    toggleBookmark,
    report,
    submitComment,
  } = useCommunityDetailState(id);

  async function handleLike() {
    try {
      await like();
      if (post?.isLiked) {
        toast.info("你已经点过赞了");
      }
    } catch {
      toast.error("点赞失败，请稍后重试");
    }
  }

  async function handleBookmark() {
    try {
      await toggleBookmark();
      toast.success(post?.isBookmarked ? "已取消收藏" : "已收藏");
    } catch {
      toast.error("收藏操作失败，请稍后重试");
    }
  }

  async function handleReport() {
    try {
      await report("用户从帖子详情页举报");
      toast.success("举报已提交，后台会尽快处理");
    } catch {
      toast.error("举报提交失败，请稍后重试");
    }
  }

  async function handleShare() {
    if (!post) {
      return;
    }

    try {
      const result = await shareCurrentPage({
        title: post.title,
        text: `Caregiver 护理助手社区：${post.title}`,
      });
      toast.success(result === "shared" ? "分享面板已打开" : "帖子链接已复制");
    } catch (shareError) {
      if (isShareCancelled(shareError)) {
        return;
      }
      toast.error("分享失败，请稍后重试");
    }
  }

  async function handleSubmitComment() {
    try {
      const comment = await submitComment();
      if (comment) {
        toast.success("评论已提交审核");
      }
    } catch {
      toast.error("评论提交失败，请稍后重试");
    }
  }

  return (
    <div className="mobile-fixed-page bg-background">
      <Toaster position="top-center" richColors />
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/community")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">帖子详情</h1>
          <div className="flex items-center gap-1">
            {post ? (
              <button
                onClick={() => void handleBookmark()}
                disabled={isMutating}
                className="p-2 disabled:opacity-50"
                aria-label="收藏帖子"
              >
                <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
              </button>
            ) : null}
            {post ? (
              <button
                onClick={() => void handleReport()}
                disabled={isMutating}
                className="p-2 disabled:opacity-50"
                aria-label="举报帖子"
              >
                <Flag className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mobile-fixed-page-body px-6 py-6 pb-28">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            正在加载帖子详情...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">帖子加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {post && !error ? (
          <>
            <div className="bg-card rounded-2xl p-5 border border-border mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                  {post.author.username.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{post.author.username}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {getCommunityTagLabel(post.tag)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusClass(post.status)}`}>
                      {getCommunityStatusLabel(post.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDateTimeLabel(post.createdAt)}</p>
                </div>
              </div>

              <h2 className="text-xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {post.title}
              </h2>

              <div className="text-sm text-foreground/80 whitespace-pre-line mb-6 leading-relaxed">
                {post.content}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <button
                  onClick={() => void handleLike()}
                  disabled={isMutating || post.isLiked}
                  className={`flex items-center gap-2 transition-colors disabled:opacity-70 ${
                    post.isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <ThumbsUp className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                  <span>{post.likeCount}</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span>{visibleCommentCount}</span>
                </div>
                <button
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto"
                  onClick={() => void handleShare()}
                >
                  <Share2 className="w-5 h-5" />
                  <span>分享</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-4">评论 ({visibleCommentCount})</h3>
              <div className="space-y-4">
                {comments.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {item.author.username.slice(0, 1)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-medium text-sm">{item.author.username}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTimeLabel(item.createdAt)}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${statusClass(item.status)}`}>
                            {getCommunityStatusLabel(item.status)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">{item.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    暂无评论
                  </div>
                ) : null}
              </div>
            </div>

            {authorPosts.length > 0 ? (
              <div className="bg-card rounded-2xl p-5 border border-border mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{post.author.username}</p>
                    <p className="text-xs text-muted-foreground">作者其他讨论</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {authorPosts.map((authorPost) => (
                    <button
                      key={authorPost.id}
                      onClick={() => navigate(`/community/${authorPost.id}`)}
                      className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1 line-clamp-1">{authorPost.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {getCommunityTagLabel(authorPost.tag)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {authorPost.likeCount}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedPosts.length > 0 ? (
              <div>
                <h3 className="font-medium mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  相关讨论
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((relatedPost) => (
                    <button
                      key={relatedPost.id}
                      onClick={() => navigate(`/community/${relatedPost.id}`)}
                      className="w-full bg-card rounded-2xl p-4 border border-border hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{relatedPost.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{relatedPost.author.username}</span>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {getCommunityTagLabel(relatedPost.tag)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {relatedPost.likeCount}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {post && !error ? (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t border-border bg-card">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="flex-1 px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                placeholder="写下你的评论，提交后进入审核"
              />
              <button
                onClick={() => void handleSubmitComment()}
                disabled={!commentText.trim() || isMutating}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
