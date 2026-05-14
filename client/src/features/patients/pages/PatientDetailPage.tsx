import { useNavigate, useParams } from "react-router";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Edit,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { careTaskPriorityLabels, careTaskStatusLabels } from "../../../entities/care-task/mapper";
import { appRoutes } from "../../../shared/constants/routes";
import { careTheme } from "../../../shared/theme/tokens";
import { PatientDetailTabs } from "../components/PatientDetailTabs";
import { usePatientDetailState } from "../state/usePatientDetailState";

export function PatientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { detailView, activeTab, setActiveTab, isLoading, error } = usePatientDetailState(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-20">
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          患者中心页加载中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background px-6 py-20">
        <button onClick={() => navigate(appRoutes.patients)} className="text-sm text-primary">
          返回患者列表
        </button>
        <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-6">
          <h1 className="text-xl mb-2 text-accent">患者中心页加载失败</h1>
          <p className="text-sm text-foreground/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!detailView || !id) {
    return (
      <div className="min-h-screen bg-background px-6 py-20">
        <button onClick={() => navigate(appRoutes.patients)} className="text-sm text-primary">
          返回患者列表
        </button>
        <div className="mt-6 bg-card rounded-2xl border border-border p-6">
          <h1 className="text-xl mb-2">未找到患者</h1>
          <p className="text-sm text-muted-foreground">
            当前页面已切换到 patient entity + detail view model 驱动，但该患者数据尚不存在。
          </p>
        </div>
      </div>
    );
  }

  const changePrefix = detailView.trendPreview.changePercent > 0 ? "+" : "";

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(appRoutes.patients)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(appRoutes.patientEdit(id))}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">编辑</span>
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
            {detailView.patient.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {detailView.patient.name}
            </h1>
            <p className="text-white/80 text-sm mb-2">
              {detailView.patient.age}岁 · {detailView.patient.gender}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                {detailView.conditionSummary}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-xl mb-0.5">{detailView.overview.recordCount}</div>
            <div className="text-white/70 text-xs">护理记录</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-xl mb-0.5">{detailView.overview.pendingTaskCount}</div>
            <div className="text-white/70 text-xs">待办任务</div>
          </div>
          <div className="text-center">
            <div className="text-xl mb-0.5">{detailView.overview.trendWindowDays}天</div>
            <div className="text-white/70 text-xs">趋势数据</div>
          </div>
        </div>
      </div>

      <div className="mobile-fixed-page-body">
      <PatientDetailTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="px-6 py-6 pb-28">
        {activeTab === "info" ? (
          <div className="space-y-5">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">患者核心信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">姓名</span>
                  <span className="text-sm font-medium">{detailView.patient.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">年龄</span>
                  <span className="text-sm font-medium">{detailView.patient.age}岁</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">性别</span>
                  <span className="text-sm font-medium">{detailView.patient.gender}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">页面聚合病情说明</span>
                  <span className="text-sm font-medium">{detailView.conditionSummary}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">护理说明</h2>
              <p className="text-sm leading-relaxed text-foreground/80">
                {detailView.patient.profileNote}
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === "records" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">最近护理记录预览</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(appRoutes.aiAssistant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI记录
                </button>
                <button
                  onClick={() => navigate(appRoutes.newRecordForPatient(id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              </div>
            </div>

            {detailView.recentRecords.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">{record.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{record.timeLabel}</span>
                </div>
                <p className="text-base font-medium text-foreground mb-2">{record.valueLabel}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      record.isAiGenerated
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {record.sourceLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-chart-2/10 text-chart-2">
                    {record.statusLabel}
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate(appRoutes.patientRecords(id))}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              查看全部记录
            </button>
          </div>
        ) : null}

        {activeTab === "tasks" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">近期护理任务预览</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(appRoutes.aiAssistant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI创建
                </button>
                <button
                  onClick={() => navigate(appRoutes.newTaskForPatient(id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              </div>
            </div>

            {detailView.upcomingTasks.map((task) => (
              <div key={task.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.status === "pending" ? "bg-accent/10" : "bg-primary/10"
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        task.status === "pending" ? "text-accent" : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium">{task.title}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          task.status === "pending"
                            ? "bg-accent/10 text-accent"
                            : "bg-chart-2/10 text-chart-2"
                        }`}
                      >
                        {careTaskStatusLabels[task.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{task.timeLabel}</span>
                      <span className="px-1.5 py-0.5 bg-muted/50 rounded">{task.repeatRuleLabel}</span>
                      {task.priority === "high" ? (
                        <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded">
                          {careTaskPriorityLabels[task.priority]}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate(appRoutes.patientTasks(id))}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              查看全部任务
            </button>
          </div>
        ) : null}

        {activeTab === "trend" ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">近 7 天血压趋势预览</p>
              <button
                onClick={() => navigate(appRoutes.healthTrend(id))}
                className="flex items-center gap-1 text-primary text-sm"
              >
                完整分析
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: careTheme.chart.primary }} />
                  收缩压
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: careTheme.chart.secondary }} />
                  舒张压
                </div>
              </div>

              {detailView.trendPreview.chartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detailView.trendPreview.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={careTheme.chart.grid} />
                      <XAxis dataKey="date" stroke="#636E72" style={{ fontSize: "11px" }} />
                      <YAxis stroke="#636E72" style={{ fontSize: "11px" }} domain={[70, 150]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: `1px solid ${careTheme.chart.tooltipBorder}`,
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke={careTheme.chart.primary}
                        strokeWidth={2.5}
                        dot={{ fill: careTheme.chart.primary, r: 3 }}
                        name="收缩压"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke={careTheme.chart.secondary}
                        strokeWidth={2.5}
                        dot={{ fill: careTheme.chart.secondary, r: 3 }}
                        name="舒张压"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-2xl bg-muted/30 border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                  当前暂无可展示的血压趋势数据
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <p className="text-lg font-medium text-primary">{detailView.trendPreview.averageSystolic}</p>
                <p className="text-xs text-muted-foreground mt-0.5">mmHg</p>
                <p className="text-xs text-muted-foreground mt-1">平均收缩压</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <p className="text-lg font-medium text-chart-2">{detailView.trendPreview.averageDiastolic}</p>
                <p className="text-xs text-muted-foreground mt-0.5">mmHg</p>
                <p className="text-xs text-muted-foreground mt-1">平均舒张压</p>
              </div>
              <div className="bg-card rounded-2xl p-4 border border-border text-center">
                <p className="text-lg font-medium text-primary">
                  {changePrefix}
                  {detailView.trendPreview.changePercent}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">较首日</p>
                <p className="text-xs text-muted-foreground mt-1">趋势变化</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">趋势预览总结</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {detailView.trendPreview.summaryText}
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed mt-3">
                {detailView.trendPreview.insightText}
              </p>
              <button
                onClick={() => navigate(appRoutes.healthTrend(id))}
                className="mt-3 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                查看完整健康趋势分析
              </button>
            </div>
          </div>
        ) : null}
      </div>
      </div>

      <button
        onClick={() => navigate(appRoutes.aiAssistant)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-20"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );
}
