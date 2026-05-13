import { useNavigate } from "react-router";
import { Search, Plus, MessageCircle, ThumbsUp, TrendingUp, BookOpen, Shield, Users } from "lucide-react";
import { useState } from "react";

export function CommunityListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("community");
  const [searchQuery, setSearchQuery] = useState("");

  const posts = [
    {
      id: 1,
      author: "护理员小王",
      avatar: "王",
      title: "分享一个测血压的小技巧",
      content: "最近发现很多新手护理员测血压时容易出现误差，我总结了几个要点：1. 测量前要让患者安静休息5分钟...",
      likes: 24,
      comments: 8,
      time: "2小时前",
      tag: "经验分享",
      status: "approved",
    },
    {
      id: 2,
      author: "李护士",
      avatar: "李",
      title: "老年糖尿病患者的饮食记录表格",
      content: "整理了一份适合老年糖尿病患者的饮食记录表，包括血糖监测时间点、餐食内容等，希望对大家有帮助...",
      likes: 36,
      comments: 12,
      time: "5小时前",
      tag: "工具分享",
      status: "approved",
    },
    {
      id: 3,
      author: "张家属",
      avatar: "张",
      title: "照顾卧床老人的心得体会",
      content: "照顾母亲已经三年了，期间积累了不少预防压疮的经验，想和大家交流一下...",
      likes: 18,
      comments: 5,
      time: "昨天",
      tag: "经验分享",
      status: "approved",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/knowledge")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm text-white/60 bg-transparent"
          >
            <BookOpen className="w-4 h-4" />
            知识学习
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm bg-white/20 backdrop-blur-sm"
          >
            <Users className="w-4 h-4" />
            经验交流
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索经验分享"
          />
        </div>
      </div>

      <div className="px-6 py-4 bg-chart-2/10 border-y border-chart-2/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">合规交流区</p>
            <p className="text-xs text-muted-foreground">
              所有帖子经过审核后发布，禁止医疗诊断、药品推荐等违规内容。仅限护理经验、工具分享。
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg">最新交流</h2>
          <button
            onClick={() => navigate("/community/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">发帖</span>
          </button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/community/${post.id}`)}
              className="w-full bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{post.author}</span>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {post.tag}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-medium mb-2">社区规范</h3>
              <div className="space-y-2 text-sm text-foreground/80">
                <p>✓ 可以分享：护理技巧、经验心得、工具表格</p>
                <p>✗ 禁止发布：疾病诊断、药品推荐、广告推广</p>
                <p className="text-xs text-muted-foreground mt-3">
                  违规内容将被删除，严重违规者将被禁言
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}