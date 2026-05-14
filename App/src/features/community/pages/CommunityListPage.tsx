import { useNavigate } from "react-router";
import { BookOpen, MessageCircle, Plus, Search, Shield, ThumbsUp, Users } from "lucide-react";
import { communityTagOptions, getCommunityStatusLabel, getCommunityTagLabel } from "@/features/community/model";
import { useCommunityListState } from "@/features/community/state/useCommunityListState";
import { formatDateTimeLabel } from "@/shared/lib/date";

function statusClass(status: string) {
  if (status === "passed") {
    return "bg-primary/10 text-primary";
  }
  if (status === "rejected") {
    return "bg-accent/10 text-accent";
  }
  return "bg-chart-4/20 text-accent";
}

export function CommunityListPage() {
  const navigate = useNavigate();
  const {
    posts,
    total,
    searchQuery,
    activeTag,
    isLoading,
    error,
    setSearchQuery,
    setActiveTag,
    retry,
  } = useCommunityListState();

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/knowledge")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-white/60 bg-transparent"
          >
            <BookOpen className="w-4 h-4" />
            知识学习
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm bg-white/20 backdrop-blur-sm">
            <Users className="w-4 h-4" />
            经验交流
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索经验分享"
          />
        </div>
      </div>

      <div className="mobile-fixed-page-body">
      <div className="px-6 py-3 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {communityTagOptions.map((tag) => (
            <button
              key={tag.value || "all"}
              onClick={() => setActiveTag(tag.value)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                activeTag === tag.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-chart-2/10 border-y border-chart-2/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">合规交流区</p>
            <p className="text-xs text-muted-foreground">
              发帖默认进入待审核状态，审核通过后对其他用户可见。请只分享护理经验、工具与照护问题。
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg">最新交流</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "正在加载社区帖子..." : `共 ${total} 条讨论`}
            </p>
          </div>
          <button
            onClick={() => navigate("/community/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">发帖</span>
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">社区内容加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {!error ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/community/${post.id}`)}
                className="w-full bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {post.author.username.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium">{post.author.username}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTimeLabel(post.createdAt)}</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        {getCommunityTagLabel(post.tag)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${statusClass(post.status)}`}>
                        {getCommunityStatusLabel(post.status)}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {!isLoading && posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">暂无相关讨论</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-medium mb-2">社区规范</h3>
              <div className="space-y-2 text-sm text-foreground/80">
                <p>可以分享：护理技巧、经验心得、工具表格。</p>
                <p>禁止发布：疾病诊断、药品推荐、广告推广。</p>
                <p className="text-xs text-muted-foreground mt-3">
                  违规内容将被拒绝或下架，严重违规用户会被后台禁用。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
