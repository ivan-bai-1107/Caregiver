import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Plus,
  Users,
  ClipboardList,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Activity,
  Thermometer,
  Droplet,
  Pill,
  Heart,
  Clock,
  CheckCircle2,
  CalendarClock,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast, Toaster } from "sonner";

type CareTab = "patients" | "records" | "tasks";

/* ─── Mock Data ─── */

const patients = [
  { id: 1, name: "张明", age: 68, gender: "男", condition: "高血压", status: "attention", lastRecord: "2小时前" },
  { id: 2, name: "李华", age: 72, gender: "女", condition: "糖尿病", status: "stable", lastRecord: "5小时前" },
  { id: 3, name: "王芳", age: 65, gender: "女", condition: "康复期", status: "improving", lastRecord: "1天前" },
  { id: 4, name: "赵强", age: 70, gender: "男", condition: "心脏病", status: "stable", lastRecord: "3小时前" },
];

const records = [
  { id: 1, patient: "张明", type: "blood_pressure", title: "血压测量", desc: "收缩压 130 / 舒张压 85", time: "今天 09:15", source: "AI", confirmed: true },
  { id: 2, patient: "李华", type: "medication", title: "用药记录", desc: "降糖药 1片，餐后服用", time: "今天 08:00", source: "手动", confirmed: true },
  { id: 3, patient: "王芳", type: "temperature", title: "体温测量", desc: "36.5°C，体征正常", time: "今天 07:30", source: "手动", confirmed: true },
  { id: 4, patient: "张明", type: "blood_sugar", title: "血糖测量", desc: "6.2 mmol/L", time: "昨天 07:00", source: "AI", confirmed: false },
  { id: 5, patient: "李华", type: "heart_rate", title: "心率监测", desc: "72 bpm，节律规则", time: "昨天 20:00", source: "手动", confirmed: true },
];

const initialTasks = [
  { id: 1, patient: "张明", title: "测量血压", time: "今天 09:00", status: "completed", priority: "normal", cycle: "每天" },
  { id: 2, patient: "李华", title: "服药提醒", time: "今天 10:30", status: "pending", priority: "high", cycle: "每天" },
  { id: 3, patient: "王芳", title: "康复训练", time: "今天 14:00", status: "pending", priority: "normal", cycle: "每天" },
  { id: 4, patient: "张明", title: "血糖检测", time: "今天 16:00", status: "pending", priority: "high", cycle: "每天" },
  { id: 5, patient: "李华", title: "复诊预约", time: "明天 09:00", status: "scheduled", priority: "normal", cycle: "仅一次" },
];

/* ─── Helpers ─── */

const getStatusConfig = (status: string) => {
  switch (status) {
    case "stable": return { color: "bg-primary/10 text-primary", label: "稳定" };
    case "improving": return { color: "bg-chart-2/10 text-chart-2", label: "好转" };
    case "attention": return { color: "bg-accent/10 text-accent", label: "关注" };
    default: return { color: "bg-muted text-muted-foreground", label: "未知" };
  }
};

const getRecordIcon = (type: string) => {
  switch (type) {
    case "blood_pressure": return <Activity className="w-5 h-5" />;
    case "temperature": return <Thermometer className="w-5 h-5" />;
    case "blood_sugar": return <Droplet className="w-5 h-5" />;
    case "medication": return <Pill className="w-5 h-5" />;
    case "heart_rate": return <Heart className="w-5 h-5" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const getRecordColor = (type: string) => {
  switch (type) {
    case "blood_pressure": return "bg-primary/10 text-primary";
    case "temperature": return "bg-accent/10 text-accent";
    case "blood_sugar": return "bg-chart-2/10 text-chart-2";
    case "medication": return "bg-[#6C9BD1]/10 text-[#6C9BD1]";
    case "heart_rate": return "bg-destructive/10 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const getTaskStatusConfig = (status: string) => {
  switch (status) {
    case "completed": return { icon: CheckCircle2, colorClass: "text-primary", bgClass: "bg-primary/10", label: "已完成" };
    case "pending": return { icon: Clock, colorClass: "text-accent", bgClass: "bg-accent/10", label: "待完成" };
    case "scheduled": return { icon: CalendarClock, colorClass: "text-chart-2", bgClass: "bg-chart-2/10", label: "已安排" };
    default: return { icon: Clock, colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "未知" };
  }
};

/* ─── Component ─── */

export function CareWorkflowPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CareTab>("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState(initialTasks);

  const handleCompleteTask = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t)));
    toast.success(`已完成「${task?.title}」`);
  };

  const tabs: { key: CareTab; label: string; icon: typeof Users; count: number }[] = [
    { key: "patients", label: "患者", icon: Users, count: patients.length },
    { key: "records", label: "记录", icon: ClipboardList, count: records.length },
    { key: "tasks", label: "任务", icon: CheckSquare, count: tasks.filter((t) => t.status === "pending").length },
  ];

  const filteredPatients = patients.filter((p) =>
    !searchQuery || p.name.includes(searchQuery) || p.condition.includes(searchQuery)
  );

  const getAddAction = () => {
    switch (activeTab) {
      case "patients": return { label: "添加患者", path: "/patients/new" };
      case "records": return { label: "新增记录", path: "/records/new" };
      case "tasks": return { label: "新增任务", path: "/tasks/new" };
    }
  };

  const addAction = getAddAction();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            照护管理
          </h1>
          <button
            onClick={() => navigate(addAction.path)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            {addAction.label}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-2xl mb-0.5">{patients.length}</div>
            <div className="text-white/70 text-xs">管理患者</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl mb-0.5">{records.length}</div>
            <div className="text-white/70 text-xs">今日记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-0.5">{tasks.filter((t) => t.status === "pending").length}</div>
            <div className="text-white/70 text-xs">待办任务</div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-card border-b border-border px-4 sticky top-0 z-10">
        <div className="flex items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
                {tab.key === "tasks" && tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search (patients & records) */}
      {(activeTab === "patients" || activeTab === "records") && (
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder={activeTab === "patients" ? "搜索患者姓名、病情..." : "搜索记录内容..."}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4 pb-28">

        {/* ── 患者 Tab ── */}
        {activeTab === "patients" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              共 {filteredPatients.length} 位患者
            </p>
            {filteredPatients.map((patient) => {
              const sc = getStatusConfig(patient.status);
              return (
                <button
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="w-full bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg flex-shrink-0">
                      {patient.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{patient.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{patient.age} · {patient.gender}</span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {patient.condition}
                        </span>
                        <span>最近: {patient.lastRecord}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => navigate("/patients/new")}
              className="w-full bg-primary/5 rounded-2xl p-4 border border-dashed border-primary/30 flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary">添加新患者</span>
            </button>
          </div>
        )}

        {/* ── 记录 Tab ── */}
        {activeTab === "records" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">共 {records.length} 条记录</p>
              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 记录
              </button>
            </div>
            {records.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getRecordColor(record.type)}`}>
                    {getRecordIcon(record.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium text-sm">{record.title}</h3>
                      <span className="text-xs text-muted-foreground">{record.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">患者：{record.patient}</p>
                    <p className="text-sm text-foreground/80 mb-2">{record.desc}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        record.source === "AI" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {record.source === "AI" ? "AI 生成" : "手动录入"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        record.confirmed ? "bg-chart-2/10 text-chart-2" : "bg-accent/10 text-accent"
                      }`}>
                        {record.confirmed ? "已确认" : "待确认"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/records")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              查看全部记录
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── 任务 Tab ── */}
        {activeTab === "tasks" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                {tasks.filter((t) => t.status === "pending").length} 项待完成
              </p>
              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 创建
              </button>
            </div>
            {tasks.map((task) => {
              const sc = getTaskStatusConfig(task.status);
              const StatusIcon = sc.icon;
              return (
                <div
                  key={task.id}
                  className={`bg-card rounded-2xl p-4 border transition-colors ${
                    task.priority === "high" ? "border-accent/30" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.bgClass}`}>
                      <StatusIcon className={`w-5 h-5 ${sc.colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h3>
                          {task.priority === "high" && (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">重要</span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${
                          task.status === "completed" ? "bg-primary/10 text-primary"
                            : task.status === "pending" ? "bg-accent/10 text-accent"
                            : "bg-chart-2/10 text-chart-2"
                        }`}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5">患者：{task.patient}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded-lg">
                          {task.cycle !== "仅一次" && <RefreshCw className="w-3 h-3" />}
                          {task.cycle}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.status === "pending" && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="w-full mt-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      标记完成
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => navigate("/tasks")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              查看全部任务
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}