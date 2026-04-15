import { useNavigate } from "react-router";
import { Search, BookOpen, Users, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";

type Category = "all" | "diet" | "chronic" | "rehab" | "symptoms";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "diet", label: "饮食护理" },
  { key: "chronic", label: "慢病管理" },
  { key: "rehab", label: "康复训练" },
  { key: "symptoms", label: "常见症状处理" },
];

const articles = [
  {
    id: 1,
    title: "高血压患者的日常护理要点",
    category: "chronic" as Category,
    categoryLabel: "慢病管理",
    type: "图文",
    summary: "涵盖血压监测、用药管理、饮食控制及情绪调节等核心内容，适合家庭照顾者参考。",
    readTime: "5分钟",
    source: "中国高血压防治指南",
    views: 1234,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 2,
    title: "糖尿病患者血糖监测完整指南",
    category: "chronic" as Category,
    categoryLabel: "慢病管理",
    type: "图文",
    summary: "详解空腹血糖、餐后血糖的正确测量方法，以及常见血糖波动的护理应对策略。",
    readTime: "7分钟",
    source: "中国糖尿病护理标准",
    views: 987,
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    id: 3,
    title: "老年人三餐营养搭配原则",
    category: "diet" as Category,
    categoryLabel: "饮食护理",
    type: "图文",
    summary: "基于老年人消化特点，提供低盐、低脂、高纤维的日常饮食搭配建议和食谱示例。",
    readTime: "6分钟",
    source: "中国营养学会",
    views: 856,
    color: "bg-accent/10 text-accent",
  },
  {
    id: 4,
    title: "卧床患者的预防压疮护理技巧",
    category: "rehab" as Category,
    categoryLabel: "康复训练",
    type: "图文",
    summary: "系统介绍皮肤检查、体位变换、气垫使用等预防压疮的专业护理操作方法。",
    readTime: "8分钟",
    source: "临床护理实践指南",
    views: 723,
    color: "bg-[#6C9BD1]/10 text-[#6C9BD1]",
  },
  {
    id: 5,
    title: "脑卒中患者上肢康复训练方案",
    category: "rehab" as Category,
    categoryLabel: "康复训练",
    type: "视频",
    summary: "分阶段演示脑卒中后上肢功能康复训练动作，适合居家照顾者辅助患者练习。",
    readTime: "12分钟",
    source: "国家康复医学指南",
    views: 612,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 6,
    title: "老年人发热的护理与观察要点",
    category: "symptoms" as Category,
    categoryLabel: "常见症状处理",
    type: "图文",
    summary: "如何判断发热程度、正确处理发热症状、何时需要及时就医，以及发热期间的护理方法。",
    readTime: "5分钟",
    source: "家庭护理手册",
    views: 534,
    color: "bg-accent/10 text-accent",
  },
];

export function KnowledgeListPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"knowledge" | "community">("knowledge");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === "all" || a.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      a.title.includes(searchQuery) ||
      a.summary.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        {/* Section Toggle */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setActiveSection("knowledge")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm transition-colors ${
              activeSection === "knowledge"
                ? "bg-white/20 backdrop-blur-sm"
                : "bg-transparent text-white/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            知识学习
          </button>
          <button
            onClick={() => {
              setActiveSection("community");
              navigate("/community");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm transition-colors ${
              activeSection === "community"
                ? "bg-white/20 backdrop-blur-sm"
                : "bg-transparent text-white/60"
            }`}
          >
            <Users className="w-4 h-4" />
            经验交流
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索护理知识..."
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 py-3 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">共 {filtered.length} 篇文章</p>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <BookOpen className="w-3.5 h-3.5" />
            <span>专业审核</span>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((article) => (
            <button
              key={article.id}
              onClick={() => navigate(`/knowledge/${article.id}`)}
              className="w-full bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex items-start gap-4">
                {/* Icon / Cover placeholder */}
                <div
                  className={`w-14 h-14 rounded-2xl ${article.color} flex items-center justify-center flex-shrink-0`}
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
                        article.type === "视频"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {article.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2 py-0.5 bg-primary/8 text-primary rounded text-xs">
                      {article.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
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

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">暂无相关内容</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-muted/30 rounded-2xl p-5 border border-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1.5">内容声明</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                所有文章均由专业医护人员审核，确保内容准确、实用。文章内容仅供参考，具体护理方案请遵主治医生指导。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}