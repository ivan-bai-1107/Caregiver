import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BookOpen, ChevronRight, Clock, Eye, Heart, Share2, User } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useKnowledgeDetailState } from "@/features/knowledge/state/useKnowledgeDetailState";
import { isShareCancelled, shareCurrentPage } from "@/shared/lib/share";

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("# ")) {
        return (
          <h2 key={index} className="text-lg mt-6 mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {block.replace(/^#\s+/, "")}
          </h2>
        );
      }

      return (
        <p key={index} className="text-sm text-foreground/80 leading-relaxed">
          {block}
        </p>
      );
    });
}

export function KnowledgeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const {
    article,
    relatedArticles,
    isLoading,
    isMutating,
    error,
    retry,
    like,
  } = useKnowledgeDetailState(id);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  async function handleShare() {
    if (!article) {
      return;
    }

    try {
      const result = await shareCurrentPage({
        title: article.title,
        text: `Caregiver 护理助手：${article.title}`,
      });
      toast.success(result === "shared" ? "分享面板已打开" : "文章链接已复制");
    } catch (shareError) {
      if (isShareCancelled(shareError)) {
        return;
      }
      toast.error("分享失败，请稍后重试");
    }
  }

  return (
    <div className="mobile-fixed-page bg-background">
      <Toaster position="top-center" richColors />
      <div className="mobile-fixed-page-header bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/knowledge")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">文章详情</h1>
          <div className="w-10" />
        </div>
      </div>

      <div ref={bodyRef} className="mobile-fixed-page-body px-6 py-6 pb-12">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            知识文章加载中...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">知识文章加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {article && !error ? (
          <>
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                  {article.categoryName}
                </span>
                {article.articleType === "video" ? (
                  <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-lg ml-2">
                    视频知识
                  </span>
                ) : null}
              </div>
              <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTimeMinutes}分钟{article.articleType === "video" ? "观看" : "阅读"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewCount}次浏览</span>
                </div>
                <span>{formatDateLabel(article.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{article.authorName}</p>
                  <p className="text-xs text-muted-foreground">{article.authorTitle}</p>
                </div>
              </div>
            </div>

            {article.articleType === "video" ? (
              <div className="bg-card rounded-2xl p-5 border border-border mb-6">
                {article.videoUrl ? (
                  <video
                    controls
                    preload="metadata"
                    src={article.videoUrl}
                    className="aspect-video w-full rounded-2xl bg-black"
                  >
                    当前浏览器不支持视频播放。
                  </video>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">视频暂不可播放</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        该视频知识尚未配置视频地址，请在后台知识内容管理中补充视频 URL。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              {renderContent(article.content)}
            </div>

            <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="text-sm text-foreground/80">
                <strong className="text-primary">内容来源：</strong>
                {article.source}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                本文内容仅供护理学习参考，具体护理方案请遵主治医生指导。
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => void like()}
                disabled={isMutating}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors disabled:opacity-50 ${
                  article.isLiked
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Heart className={`w-5 h-5 ${article.isLiked ? "fill-current" : ""}`} />
                <span>{article.isLiked ? `已点赞 (${article.likeCount})` : `觉得有用 (${article.likeCount})`}</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-2xl hover:bg-muted/80 transition-colors"
                onClick={() => void handleShare()}
              >
                <Share2 className="w-5 h-5" />
                <span>分享</span>
              </button>
            </div>

            {relatedArticles.length > 0 ? (
              <div className="mt-8">
                <h3 className="font-medium mb-4" style={{ fontFamily: "var(--font-display)" }}>
                  相关文章推荐
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((related) => (
                    <button
                      key={related.id}
                      onClick={() => navigate(`/knowledge/${related.id}`)}
                      className="w-full bg-card rounded-2xl p-4 border border-border hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                              {related.categoryName}
                            </span>
                          </div>
                          <p className="font-medium mb-2">{related.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{related.viewCount}次浏览</span>
                            </div>
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
    </div>
  );
}
