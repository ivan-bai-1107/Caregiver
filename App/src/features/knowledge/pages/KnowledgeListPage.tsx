import { useNavigate } from "react-router";
import { BookOpen, Clock, ExternalLink, Search, Users } from "lucide-react";
import { useKnowledgeListState } from "@/features/knowledge/state/useKnowledgeListState";
import type { KnowledgeArticleListItem } from "@/features/knowledge/model";

const articleTypeLabels: Record<KnowledgeArticleListItem["articleType"], string> = {
  article: "图文",
  video: "视频",
};

function coverClass(color: string) {
  switch (color) {
    case "blue":
      return "bg-chart-2/10 text-chart-2";
    case "accent":
      return "bg-accent/10 text-accent";
    case "warm":
      return "bg-chart-4/15 text-accent";
    default:
      return "bg-primary/10 text-primary";
  }
}

export function KnowledgeListPage() {
  const navigate = useNavigate();
  const {
    categoryTabs,
    articles,
    total,
    searchQuery,
    activeCategoryId,
    isLoading,
    error,
    setSearchQuery,
    setActiveCategoryId,
    retry,
  } = useKnowledgeListState();

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-5">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm bg-white/20 backdrop-blur-sm">
            <BookOpen className="w-4 h-4" />
            知识学习
          </button>
          <button
            onClick={() => navigate("/community")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm bg-transparent text-white/60 transition-colors"
          >
            <Users className="w-4 h-4" />
            经验交流
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索护理知识..."
          />
        </div>
      </div>

      <div className="mobile-fixed-page-body">
      <div className="px-6 py-3 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {categoryTabs.map((category) => (
            <button
              key={category.id || "all"}
              onClick={() => setActiveCategoryId(category.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                activeCategoryId === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "正在加载知识内容..." : `共 ${total} 篇文章`}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <BookOpen className="w-3.5 h-3.5" />
            <span>专业审核</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">知识内容加载失败</p>
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
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate(`/knowledge/${article.id}`)}
                className="w-full bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${coverClass(article.coverColor)} flex items-center justify-center flex-shrink-0`}
                  >
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                          article.articleType === "video"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {articleTypeLabels[article.articleType]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary/8 text-primary rounded text-xs">
                        {article.categoryName}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {article.readTimeMinutes}分钟
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="w-3 h-3" />
                        {article.source}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {!isLoading && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">暂无相关内容</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 bg-muted/30 rounded-2xl p-5 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1.5">内容声明</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                文章内容仅供照护学习参考，不构成医疗诊断或治疗建议。具体护理方案请遵主治医生指导。
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
