import { useNavigate } from "react-router";
import { Bot, CheckSquare, FileText, MessageSquare, RefreshCw, Users } from "lucide-react";
import { useAdminDashboardState } from "@/features/admin/state/useAdminDashboardState";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { summary, isLoading, error, retry } = useAdminDashboardState();

  const stats = [
    { label: "注册用户", value: summary?.userCount ?? 0, icon: Users, tone: "bg-chart-2/10 text-chart-2" },
    { label: "患者档案", value: summary?.patientCount ?? 0, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: "护理记录", value: summary?.recordCount ?? 0, icon: FileText, tone: "bg-chart-4/15 text-accent" },
    { label: "护理任务", value: summary?.taskCount ?? 0, icon: CheckSquare, tone: "bg-accent/10 text-accent" },
    { label: "知识文章", value: summary?.knowledgeArticleCount ?? 0, icon: FileText, tone: "bg-primary/10 text-primary" },
    { label: "AI 日志", value: summary?.aiLogCount ?? 0, icon: Bot, tone: "bg-chart-2/10 text-chart-2" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>
            仪表盘
          </h1>
        </div>
        <button
          onClick={() => void retry()}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          正在加载后台统计...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className={`w-12 h-12 rounded-xl ${stat.tone} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-gray-900" style={{ fontFamily: "var(--font-display)" }}>社区待审核</h2>
                  <p className="text-sm text-gray-500">帖子与评论审核队列</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400 mb-1">待审核帖子</p>
                  <p className="text-2xl text-gray-900">{summary.pendingPostCount}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400 mb-1">待审核评论</p>
                  <p className="text-2xl text-gray-900">{summary.pendingCommentCount}</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/admin/reviews")}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90"
              >
                进入审核
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-gray-900" style={{ fontFamily: "var(--font-display)" }}>内容与 AI</h2>
                  <p className="text-sm text-gray-500">知识内容和 AI 调用审计</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/admin/content")}
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  管理 {summary.knowledgeArticleCount} 篇知识文章
                </button>
                <button
                  onClick={() => navigate("/admin/ai-logs")}
                  className="w-full rounded-xl bg-gray-50 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  查看 {summary.aiLogCount} 条 AI 日志
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
