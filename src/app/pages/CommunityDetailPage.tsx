import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Flag, ChevronRight, Bookmark, User } from "lucide-react";
import { useState } from "react";

export function CommunityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const post = {
    id: Number(id),
    author: "护理员小王",
    avatar: "王",
    bio: "从业5年 · 擅长慢性病护理",
    title: "分享一个测血压的小技巧",
    content: `最近发现很多新手护理员测血压时容易出现误差，我总结了几个要点分享给大家：

1. 测量前准备
• 让患者安静休息至少5分钟
• 确保患者没有在30分钟内吸烟、喝咖啡或剧烈运动
• 选择合适大小的袖带

2. 测量时注意
• 患者坐姿，背部有支撑
• 上臂与心脏保持同一水平
• 袖带下缘距肘窝2-3厘米
• 不要说话，保持安静

3. 记录与分析
• 每次测量2-3次，取平均值
• 固定时间测量，便于对比
• 详细记录日期、时间和数值

希望这些经验对大家有帮助！`,
    likes: 24,
    comments: 8,
    time: "2小时前",
    tag: "经验分享",
  };

  const comments = [
    {
      id: 1,
      author: "李护士",
      avatar: "李",
      content: "非常实用的分享！我之前就因为没让患者休息够就测量，导致数值偏高。",
      time: "1小时前",
      likes: 8,
    },
    {
      id: 2,
      author: "张家属",
      avatar: "张",
      content: "学到了，原来袖带位置也有这么多讲究。感谢分享！",
      time: "30分钟前",
      likes: 5,
    },
    {
      id: 3,
      author: "陈护工",
      avatar: "陈",
      content: "请问电子血压计和水银血压计哪个更准确？我现在用的是电子的，总觉得不太放心。",
      time: "15分钟前",
      likes: 2,
    },
  ];

  const authorPosts = [
    { id: 10, title: "新手护理员必备物品清单", tag: "实用工具", likes: 45 },
    { id: 11, title: "如何和患者家属有效沟通", tag: "经验分享", likes: 38 },
  ];

  const relatedPosts = [
    { id: 20, title: "血糖监测的常见误区", author: "护士小李", tag: "经验分享", likes: 62 },
    { id: 21, title: "老年人跌倒预防指南", author: "护理专家", tag: "护理技巧", likes: 89 },
    { id: 22, title: "如何记录护理日志", author: "资深护工", tag: "实用工具", likes: 54 },
  ];

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleCommentLike = (commentId: number) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleComment = () => {
    if (comment.trim()) {
      setComment("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 flex-shrink-0 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/community")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">帖子详情</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="p-2"
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
            </button>
            <button className="p-2">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="bg-card rounded-2xl p-5 border border-border mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
              {post.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{post.author}</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                  {post.tag}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{post.time}</p>
            </div>
          </div>

          <h2 className="text-xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {post.title}
          </h2>

          <div className="text-sm text-foreground/80 whitespace-pre-line mb-6">
            {post.content}
          </div>

          <div className="flex items-center gap-6 pt-4 border-t border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                liked ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span>{liked ? post.likes + 1 : post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments}</span>
            </div>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto">
              <Share2 className="w-5 h-5" />
              <span>分享</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-4">评论 ({comments.length})</h3>
          <div className="space-y-4">
            {comments.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {item.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{item.author}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-3">{item.content}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleCommentLike(item.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          commentLikes[item.id] ? "text-primary" : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${commentLikes[item.id] ? "fill-current" : ""}`} />
                        <span>{commentLikes[item.id] ? item.likes + 1 : item.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(item.id)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        回复
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {post.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-xs text-muted-foreground">{post.bio}</p>
                </div>
                <button className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors">
                  关注
                </button>
              </div>
            </div>
          </div>

          {authorPosts.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3 text-muted-foreground">Ta的其他帖子</p>
              <div className="space-y-2">
                {authorPosts.map((authorPost) => (
                  <button
                    key={authorPost.id}
                    onClick={() => navigate(`/community/${authorPost.id}`)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{authorPost.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          {authorPost.tag}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {authorPost.likes}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-4" style={{ fontFamily: 'var(--font-display)' }}>
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
                      <span>{relatedPost.author}</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {relatedPost.tag}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {relatedPost.likes}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border bg-card flex-shrink-0">
        <div className="max-w-lg mx-auto">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-sm text-muted-foreground">
                回复 @{comments.find(c => c.id === replyingTo)?.author}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-xs text-primary hover:underline"
              >
                取消
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder={replyingTo ? "写下你的回复..." : "写下你的评论..."}
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}