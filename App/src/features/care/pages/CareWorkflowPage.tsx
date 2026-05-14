import { useNavigate } from "react-router";
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Clock,
  Droplet,
  Heart,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Thermometer,
  Users,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import type { RecordType } from "@/entities/care-record/model";
import { recordTypeLabels } from "@/entities/care-record/mapper";
import {
  careTaskPriorityLabels,
  careTaskRepeatRuleLabels,
  getCareTaskTimeLabel,
} from "@/entities/care-task/mapper";
import type { CareWorkbenchPatient, CareWorkbenchTab, CareWorkbenchTask } from "@/features/care/model";
import { useCareWorkbenchState } from "@/features/care/state/useCareWorkbenchState";
import { PullToRefresh } from "@/shared/ui/PullToRefresh";
import { formatDateTimeLabel } from "@/shared/lib/date";

type PatientStatus = "stable" | "attention";

function getPatientStatus(patient: CareWorkbenchPatient): PatientStatus {
  const text = patient.profileNote;
  if (text.includes("高血压") || text.includes("糖尿病") || text.includes("关注")) {
    return "attention";
  }
  return "stable";
}

function getStatusConfig(status: PatientStatus) {
  if (status === "attention") {
    return { color: "bg-accent/10 text-accent", label: "关注" };
  }
  return { color: "bg-primary/10 text-primary", label: "稳定" };
}

function getRecordIcon(type: RecordType) {
  switch (type) {
    case "blood_pressure":
      return <Activity className="w-5 h-5" />;
    case "temperature":
      return <Thermometer className="w-5 h-5" />;
    case "blood_sugar":
      return <Droplet className="w-5 h-5" />;
    case "medication":
      return <Pill className="w-5 h-5" />;
    case "heart_rate":
      return <Heart className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
}

function getRecordColor(type: RecordType) {
  switch (type) {
    case "blood_pressure":
      return "bg-primary/10 text-primary";
    case "temperature":
      return "bg-accent/10 text-accent";
    case "blood_sugar":
      return "bg-chart-2/10 text-chart-2";
    case "medication":
      return "bg-[#6C9BD1]/10 text-[#6C9BD1]";
    case "heart_rate":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getTaskStatusConfig(task: CareWorkbenchTask) {
  if (task.status === "completed") {
    return { icon: CheckCircle2, colorClass: "text-primary", bgClass: "bg-primary/10", label: "已完成" };
  }
  if (task.isOverdue) {
    return { icon: AlertCircle, colorClass: "text-accent", bgClass: "bg-accent/10", label: "已逾期" };
  }
  if (task.status === "scheduled") {
    return { icon: CalendarClock, colorClass: "text-chart-2", bgClass: "bg-chart-2/10", label: "已安排" };
  }
  return { icon: Clock, colorClass: "text-accent", bgClass: "bg-accent/10", label: "待完成" };
}

export function CareWorkflowPage() {
  const navigate = useNavigate();
  const {
    workbench,
    activeTab,
    searchQuery,
    isLoading,
    isMutating,
    error,
    filteredPatients,
    filteredRecords,
    filteredTasks,
    setActiveTab,
    setSearchQuery,
    loadWorkbench,
    completeTask,
  } = useCareWorkbenchState();

  const tabs: { key: CareWorkbenchTab; label: string; icon: typeof Users; count: number }[] = [
    { key: "patients", label: "患者", icon: Users, count: workbench.summary.patientCount },
    { key: "records", label: "记录", icon: ClipboardList, count: workbench.summary.recordCount },
    { key: "tasks", label: "任务", icon: CheckSquare, count: workbench.summary.pendingTaskCount },
  ];
  const addAction =
    activeTab === "patients"
      ? { label: "添加患者", path: "/patients/new" }
      : activeTab === "records"
        ? { label: "新增记录", path: "/records/new" }
        : { label: "新增任务", path: "/tasks/new" };

  async function handleRefresh() {
    const ok = await loadWorkbench(true);
    if (ok) {
      toast.success("工作台已刷新");
    }
  }

  async function handleCompleteTask(task: CareWorkbenchTask) {
    const ok = await completeTask(task.id);
    if (ok) {
      toast.success(`已完成「${task.title}」`);
    } else {
      toast.error("任务完成失败，请稍后重试");
    }
  }

  return (
    <div className="mobile-fixed-page bg-background">
      <Toaster position="top-center" richColors />
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            照护工作台
          </h1>
          <button
            onClick={() => navigate(addAction.path)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            {addAction.label}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-2xl mb-0.5">{workbench.summary.patientCount}</div>
            <div className="text-white/70 text-xs">患者</div>
          </div>
          <div className="text-center border-l border-white/20">
            <div className="text-2xl mb-0.5">{workbench.summary.recordCount}</div>
            <div className="text-white/70 text-xs">记录</div>
          </div>
          <div className="text-center border-l border-white/20">
            <div className="text-2xl mb-0.5">{workbench.summary.pendingTaskCount}</div>
            <div className="text-white/70 text-xs">待办</div>
          </div>
          <div className="text-center border-l border-white/20">
            <div className="text-2xl mb-0.5">{workbench.summary.overdueTaskCount}</div>
            <div className="text-white/70 text-xs">逾期</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "新增患者", path: "/patients/new", icon: Users },
            { label: "新增记录", path: "/records/new", icon: ClipboardList },
            { label: "新增任务", path: "/tasks/new", icon: CheckSquare },
            { label: "AI 助手", path: "/ai-assistant", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="rounded-xl bg-white/15 px-2 py-3 text-xs text-white/90"
              >
                <Icon className="mx-auto mb-1 h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <PullToRefresh onRefresh={handleRefresh} className="mobile-fixed-page-body">
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
                  isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
                {tab.count > 0 ? (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
            placeholder="搜索患者、记录或任务..."
          />
        </div>
      </div>

      <div className="px-6 py-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在加载照护工作台...
          </div>
        ) : error ? (
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <p className="text-sm text-accent mb-3">{error}</p>
            <button
              onClick={() => void loadWorkbench()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm"
            >
              重新加载
            </button>
          </div>
        ) : null}

        {!isLoading && !error && activeTab === "patients" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">共 {filteredPatients.length} 位患者</p>
            {filteredPatients.map((patient) => {
              const status = getStatusConfig(getPatientStatus(patient));
              return (
                <button
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="w-full bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg flex-shrink-0">
                      {patient.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{patient.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{patient.age}岁 · {patient.gender}</span>
                        <span className="truncate">{patient.profileNote || "护理说明待补充"}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {!isLoading && !error && activeTab === "records" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">共 {filteredRecords.length} 条最近记录</p>
              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 记录
              </button>
            </div>
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getRecordColor(record.recordType)}`}>
                    {getRecordIcon(record.recordType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium text-sm">{recordTypeLabels[record.recordType]}</h3>
                      <span className="text-xs text-muted-foreground">{formatDateTimeLabel(record.occurredAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">患者：{record.patientName}</p>
                    <p className="text-sm text-foreground/80 mb-2">{record.valueText || record.notes}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      record.source === "ai" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {record.source === "ai" ? "AI生成" : "手动记录"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredRecords.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                暂无护理记录
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !error && activeTab === "tasks" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{filteredTasks.length} 项待处理任务</p>
              <button
                onClick={() => navigate("/ai-assistant")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 创建
              </button>
            </div>
            {filteredTasks.map((task) => {
              const status = getTaskStatusConfig(task);
              const StatusIcon = status.icon;
              return (
                <div key={task.id} className={`bg-card rounded-2xl p-4 border transition-colors ${
                  task.priority === "high" ? "border-accent/30" : "border-border"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bgClass}`}>
                      <StatusIcon className={`w-5 h-5 ${status.colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{task.title}</h3>
                          {task.priority === "high" ? (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">
                              {careTaskPriorityLabels[task.priority]}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5">患者：{task.patientName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getCareTaskTimeLabel(task)}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded-lg">
                          {task.repeatRule !== "once" ? <RefreshCw className="w-3 h-3" /> : null}
                          {careTaskRepeatRuleLabels[task.repeatRule]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => void handleCompleteTask(task)}
                    disabled={isMutating}
                    className="w-full mt-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    标记完成
                  </button>
                </div>
              );
            })}
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                暂无待处理任务
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      </PullToRefresh>
    </div>
  );
}
