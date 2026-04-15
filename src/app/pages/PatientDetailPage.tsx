import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Edit,
  Activity,
  ClipboardList,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Tab = "info" | "records" | "tasks" | "trend";

export function PatientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const patient = {
    id: Number(id),
    name: "张明",
    age: 68,
    gender: "男",
    condition: "高血压、冠心病",
    profileNote: "患者有高血压病史10年，目前服用降压药，需定期监测血压。同时患有轻度冠心病，需注意心率异常。饮食方面需控制盐分摄入，每日钠盐不超过5g。避免情绪剧烈波动和重体力活动。",
  };

  const recentRecords = [
    { id: 1, type: "血压", value: "130/85 mmHg", time: "今天 09:15", status: "normal", source: "手动" },
    { id: 2, type: "用药", value: "降压药 1片", time: "今天 08:00", status: "completed", source: "手动" },
    { id: 3, type: "体温", value: "36.5°C", time: "昨天 20:00", status: "normal", source: "AI" },
    { id: 4, type: "血糖", value: "6.2 mmol/L", time: "昨天 07:30", status: "normal", source: "AI" },
  ];

  const tasks = [
    { id: 1, task: "测量血压", time: "今天 15:00", status: "pending", cycle: "每天" },
    { id: 2, task: "服药提醒", time: "今天 18:00", status: "pending", cycle: "每天" },
    { id: 3, task: "复诊预约", time: "明天 09:00", status: "scheduled", cycle: "仅一次" },
  ];

  const trendData = [
    { date: "04-08", systolic: 135, diastolic: 88 },
    { date: "04-09", systolic: 132, diastolic: 85 },
    { date: "04-10", systolic: 130, diastolic: 85 },
    { date: "04-11", systolic: 128, diastolic: 82 },
    { date: "04-12", systolic: 130, diastolic: 84 },
    { date: "04-13", systolic: 125, diastolic: 80 },
    { date: "04-14", systolic: 127, diastolic: 82 },
  ];

  const tabs: { key: Tab; label: string; icon: typeof Activity }[] = [
    { key: "info", label: "基本信息", icon: User },
    { key: "records", label: "护理记录", icon: ClipboardList },
    { key: "tasks", label: "护理任务", icon: CheckSquare },
    { key: "trend", label: "健康趋势", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate("/patients")} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">编辑</span>
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
            {patient.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {patient.name}
            </h1>
            <p className="text-white/80 text-sm mb-2">
              {patient.age}岁 · {patient.gender}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                {patient.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-xl mb-0.5">24</div>
            <div className="text-white/70 text-xs">护理记录</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-xl mb-0.5">8</div>
            <div className="text-white/70 text-xs">待办任务</div>
          </div>
          <div className="text-center">
            <div className="text-xl mb-0.5">7天</div>
            <div className="text-white/70 text-xs">趋势数据</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-4 sticky top-0 z-10">
        <div className="flex items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6 pb-28">

        {/* ── 基本信息 Tab ── */}
        {activeTab === "info" && (
          <div className="space-y-5">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">患者信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">姓名</span>
                  <span className="text-sm font-medium">{patient.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">年龄</span>
                  <span className="text-sm font-medium">{patient.age}岁</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">性别</span>
                  <span className="text-sm font-medium">{patient.gender}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">主要病情</span>
                  <span className="text-sm font-medium">{patient.condition}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">护理说明</h2>
              <p className="text-sm leading-relaxed text-foreground/80">{patient.profileNote}</p>
            </div>
          </div>
        )}

        {/* ── 护理记录 Tab ── */}
        {activeTab === "records" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">最近护理记录</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/ai-assistant")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI记录
                </button>
                <button
                  onClick={() => navigate("/records/new")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              </div>
            </div>

            {recentRecords.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">{record.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{record.time}</span>
                </div>
                <p className="text-base font-medium text-foreground mb-2">{record.value}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      record.source === "AI"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {record.source === "AI" ? "AI生成" : "手动记录"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      record.status === "normal" || record.status === "completed"
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    已确认
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate("/records?patient=" + id)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              查看全部记录
            </button>
          </div>
        )}

        {/* ── 护理任务 Tab ── */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">今日任务</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/ai-assistant")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI创建
                </button>
                <button
                  onClick={() => navigate("/tasks/new")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              </div>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      task.status === "pending"
                        ? "bg-accent/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {task.status === "pending" ? (
                      <Clock className="w-4 h-4 text-accent" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium">{task.task}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          task.status === "pending"
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {task.status === "pending" ? "待完成" : "已安排"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{task.time}</span>
                      <span className="px-1.5 py-0.5 bg-muted/50 rounded">{task.cycle}</span>
                    </div>
                  </div>
                </div>
                {task.status === "pending" && (
                  <button className="w-full mt-3 py-2 bg-primary/10 text-primary rounded-xl text-sm hover:bg-primary/20 transition-colors">
                    标记完成
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => navigate("/tasks?patient=" + id)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              查看全部任务
            </button>
          </div>
        )}

        {/* ── 健康趋势 Tab ── */}
        {activeTab === "trend" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">近7天血压趋势</p>
              <button
                onClick={() => navigate(`/health-trend/${id}`)}
                className="flex items-center gap-1 text-primary text-sm"
              >
                完整分析
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-primary rounded" />
                  收缩压
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-chart-2 rounded" />
                  舒张压
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" />
                    <XAxis dataKey="date" stroke="#636E72" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#636E72" style={{ fontSize: "11px" }} domain={[70, 150]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #DDD8CE",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#5B8A72"
                      strokeWidth={2.5}
                      dot={{ fill: "#5B8A72", r: 3 }}
                      name="收缩压"
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#6C9BD1"
                      strokeWidth={2.5}
                      dot={{ fill: "#6C9BD1", r: 3 }}
                      name="舒张压"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "平均收缩压", value: "129", unit: "mmHg", color: "text-primary" },
                { label: "平均舒张压", value: "84", unit: "mmHg", color: "text-chart-2" },
                { label: "趋势变化", value: "-5.2%", unit: "较上周", color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-4 border border-border text-center">
                  <p className={`text-lg font-medium ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.unit}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI 简要分析</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                血压整体呈下降趋势，控制效果良好。收缩压从135降至127，变化平稳。建议继续保持当前用药和生活方案。
              </p>
              <button
                onClick={() => navigate(`/health-trend/${id}`)}
                className="mt-3 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                查看完整健康趋势分析
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Button */}
      <button
        onClick={() => navigate("/ai-assistant")}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-20"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );
}