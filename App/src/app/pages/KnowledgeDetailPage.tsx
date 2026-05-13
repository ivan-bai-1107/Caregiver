import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock, Eye, Bookmark, Share2, Heart, ChevronRight, User, MessageCircle, ThumbsUp, Play, Pause, Volume2 } from "lucide-react";
import { useState } from "react";

const articlesData: Record<string, {
  title: string;
  category: string;
  type: "图文" | "视频";
  readTime: string;
  views: number;
  author: string;
  authorRole: string;
  date: string;
  videoUrl?: string;
}> = {
  "1": { title: "高血压患者的日常护理要点", category: "慢性病管理", type: "图文", readTime: "5分钟", views: 1234, author: "李医生", authorRole: "心血管内科 · 主任医师", date: "2026-04-10" },
  "2": { title: "糖尿病患者血糖监测完整指南", category: "慢性病管理", type: "图文", readTime: "7分钟", views: 987, author: "张护士", authorRole: "内分泌科 · 护师", date: "2026-04-08" },
  "3": { title: "老年人三餐营养搭配原则", category: "饮食护理", type: "图文", readTime: "6分钟", views: 856, author: "王营养师", authorRole: "营养科 · 主管营养师", date: "2026-04-05" },
  "4": { title: "卧床患者的预防压疮护理技巧", category: "康复训练", type: "图文", readTime: "8分钟", views: 723, author: "陈护师", authorRole: "康复科 · 主管护师", date: "2026-04-03" },
  "5": { title: "脑卒中患者上肢康复训练方案", category: "康复训练", type: "视频", readTime: "12分钟", views: 612, author: "赵康复师", authorRole: "康复医学科 · 副主任治疗师", date: "2026-04-01" },
  "6": { title: "老年人发热的护理与观察要点", category: "常见症状处理", type: "图文", readTime: "5分钟", views: 534, author: "刘护士", authorRole: "急诊科 · 主管护师", date: "2026-03-28" },
};

export function KnowledgeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(156);
  const [showToc, setShowToc] = useState(false);

  const article = articlesData[id || "1"] || articlesData["1"];
  const isVideo = article.type === "视频";
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const relatedArticles = [
    { id: 2, title: "糖尿病患者的血糖监测指南", category: "慢性病管理", reads: 892 },
    { id: 3, title: "心脏病患者的运动注意事项", category: "慢性病管理", reads: 745 },
    { id: 4, title: "老年人用药安全须知", category: "用药指导", reads: 1023 },
  ];

  const tableOfContents = [
    { title: "一、饮食管理", id: "section-1" },
    { title: "二、运动建议", id: "section-2" },
    { title: "三、用药管理", id: "section-3" },
    { title: "四、生活习惯", id: "section-4" },
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/knowledge")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="p-2"
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button className="p-2">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-lg">
              {article.category}
            </span>
            {isVideo && (
              <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-lg ml-2">
                视频教程
              </span>
            )}
          </div>
          <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}{isVideo ? "观看" : "阅读"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views}次{isVideo ? "观看" : "阅读"}</span>
            </div>
            <span>{article.date}</span>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{article.author}</p>
              <p className="text-xs text-muted-foreground">{article.authorRole}</p>
            </div>
          </div>
        </div>

        {/* Video Player for video type */}
        {isVideo && (
          <div className="bg-card rounded-2xl border border-border mb-6 overflow-hidden">
            <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
              {/* Simulated video frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  {!isPlaying ? (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors mb-3 mx-auto"
                    >
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors mb-3 mx-auto"
                    >
                      <Pause className="w-8 h-8 text-primary" />
                    </button>
                  )}
                  <p className="text-white/80 text-sm">
                    {isPlaying ? "正在播放训练示范..." : "点击播放康复训练视频"}
                  </p>
                </div>
              </div>

              {/* Video overlay info */}
              {isPlaying && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  播放中
                </div>
              )}

              {/* Controls bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="text-white">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: isPlaying ? "35%" : "0%" }}
                    />
                  </div>
                  <span className="text-white text-xs">{isPlaying ? "4:12" : "0:00"} / 12:00</span>
                  <button className="text-white">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video chapters */}
            <div className="p-5">
              <h3 className="font-medium mb-3 text-sm">视频章节</h3>
              <div className="space-y-2">
                {[
                  { time: "00:00", title: "训练前准备与注意事项", active: true },
                  { time: "02:30", title: "第一阶段：被动关节活动训练", active: false },
                  { time: "05:15", title: "第二阶段：辅助主动运动训练", active: false },
                  { time: "08:00", title: "第三阶段：抗阻力训练", active: false },
                  { time: "10:30", title: "训练后放松与日常建议", active: false },
                ].map((chapter, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      chapter.active ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground/70"
                    }`}
                  >
                    <span className="text-xs font-mono w-10 flex-shrink-0">{chapter.time}</span>
                    <span className="text-sm">{chapter.title}</span>
                    {chapter.active && isPlaying && (
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                        <div className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isVideo && (
          <>
        <button
          onClick={() => setShowToc(!showToc)}
          className="w-full bg-card rounded-2xl p-4 border border-border mb-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <span className="font-medium">文章目录</span>
          <ChevronRight className={`w-5 h-5 transition-transform ${showToc ? "rotate-90" : ""}`} />
        </button>

        {showToc && (
          <div className="bg-card rounded-2xl p-5 border border-border mb-6 space-y-2">
            {tableOfContents.map((item, index) => (
              <a
                key={index}
                href={`#${item.id}`}
                className="block py-2 px-3 text-sm rounded-lg hover:bg-primary/5 text-foreground/80 hover:text-primary transition-colors"
              >
                {item.title}
              </a>
            ))}
          </div>
        )}

        <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
          <section id="section-1">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              一、饮食管理
            </h2>
            <div className="space-y-3 text-sm text-foreground/80">
              <p>
                高血压患者的饮食管理是控制血压的重要环节，需要特别注意以下几点：
              </p>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p><strong>1. 低盐饮食</strong></p>
                <p className="pl-4">
                  • 每日钠盐摄入量控制在6克以内<br />
                  • 减少酱油、味精等调味品的使用<br />
                  • 避免腌制食品、咸菜等高盐食物
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p><strong>2. 增加钾的摄入</strong></p>
                <p className="pl-4">
                  • 多食用新鲜蔬菜和水果<br />
                  • 推荐香蕉、橙子、菠菜等富钾食物<br />
                  • 有助于降低血压水平
                </p>
              </div>
            </div>
          </section>

          <section id="section-2">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              二、运动建议
            </h2>
            <div className="space-y-3 text-sm text-foreground/80">
              <p>适量运动对高血压患者非常重要：</p>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p><strong>推荐运动方式</strong></p>
                <p className="pl-4">
                  • 快走：每天30-45分钟<br />
                  • 太极拳：温和的有氧运动<br />
                  • 游泳：全身性运动，适合关节不好的患者
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <p className="text-accent font-medium mb-2">
                  ⚠️ 注意事项
                </p>
                <p className="pl-4 text-foreground/80">
                  • 避免剧烈运动和突然用力<br />
                  • 运动前要充分热身<br />
                  • 如感到不适，立即停止并休息
                </p>
              </div>
            </div>
          </section>

          <section id="section-3">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              三、用药管理
            </h2>
            <div className="space-y-3 text-sm text-foreground/80">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p><strong>按时服药</strong></p>
                <p className="pl-4">
                  • 严格按照医嘱服用降压药<br />
                  • 不可随意停药或更改剂量<br />
                  • 建议固定时间服药，养成习惯
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p><strong>监测血压</strong></p>
                <p className="pl-4">
                  • 每天固定时间测量血压<br />
                  • 记录血压值，观察变化趋势<br />
                  • 定期复查，及时调整用药方案
                </p>
              </div>
            </div>
          </section>

          <section id="section-4">
            <h2 className="text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              四、生活习惯
            </h2>
            <div className="space-y-3 text-sm text-foreground/80">
              <p>良好的生活习惯有助于血压控制：</p>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="pl-4">
                  • 戒烟限酒，避免刺激性饮料<br />
                  • 保持规律作息，充足睡眠<br />
                  • 控制体重，避免肥胖<br />
                  • 保持心情舒畅，减少压力
                </p>
              </div>
            </div>
          </section>
        </div>
        </>
        )}

        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <p className="text-sm text-foreground/80">
            <strong className="text-primary">医学审核：</strong>
            本文内容已经过心血管专科医师审核，确保专业性和准确性。
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            最后更新：2026年4月10日
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-colors ${
              liked
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? `已点赞 (${likeCount})` : `觉得有用 (${likeCount})`}</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-2xl hover:bg-muted/80 transition-colors">
            <Share2 className="w-5 h-5" />
            <span>分享</span>
          </button>
        </div>

        <div className="mt-8">
          <h3 className="font-medium mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            评论与讨论
          </h3>
          <div className="bg-card rounded-2xl p-5 border border-border mb-4">
            <textarea
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="分享你的护理经验或提出问题..."
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                发表评论
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  护
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">护理员张姐</span>
                    <span className="text-xs text-muted-foreground">2天前</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    这篇文章总结得很全面！我照顾的患者就是高血压，按照这些要点执行后，血压控制得很稳定。特别是低盐饮食这块，确实很重要。
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>12</span>
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      回复
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  李
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">李先生</span>
                    <span className="text-xs text-muted-foreground">1天前</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    想请教一下，我父亲血压早上和晚上差别很大，这种情况正常吗？是否需要调整用药时间？
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>5</span>
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      回复
                    </button>
                  </div>
                </div>
              </div>

              <div className="ml-13 mt-3 bg-muted/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">李医生</span>
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                        作者
                      </span>
                      <span className="text-xs text-muted-foreground">20小时前</span>
                    </div>
                    <p className="text-sm text-foreground/80">
                      血压在一天中有波动是正常的，通常早上会偏高一些。建议您记录一周的血压数据（包括具体时间和数值），带着数据咨询主治医生，由医生根据实际情况调整用药方案。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-medium mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            相关文章推荐
          </h3>
          <div className="space-y-3">
            {relatedArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate(`/knowledge/${article.id}`)}
                className="w-full bg-card rounded-2xl p-4 border border-border hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        {article.category}
                      </span>
                    </div>
                    <p className="font-medium mb-2">{article.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.reads}次阅读</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}