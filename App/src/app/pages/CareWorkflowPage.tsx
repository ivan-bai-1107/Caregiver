import { useEffect, useMemo, useState } from "react";
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
import { toast, Toaster } from "sonner";
import { PullToRefresh } from "../components/PullToRefresh";
import type { RecordType } from "@/entities/care-record/model";
import {
  careTaskPriorityLabels,
  careTaskRepeatRuleLabels,
  getCareTaskTimeLabel,
  isCareTaskOverdue,
} from "@/entities/care-task/mapper";
import type { CareTask } from "@/entities/care-task/model";
import {
  listPatients,
  toPatientListItemView,
  type PatientListItemView,
} from "@/features/patients/services/patient.service";
import {
  listCareRecords,
  type RecordListItemView,
} from "@/features/records/services/record.service";
import {
  completeCareTask,
  listCareTasks,
} from "@/features/tasks/services/task.service";

type CareTab = "patients" | "records" | "tasks";
type PatientStatus = "stable" | "attention";

interface TaskWorkflowItem {
  id: string;
  patientName: string;
  title: string;
  remindTimeLabel: string;
  repeatRuleLabel: string;
  priorityLabel: string;
  status: CareTask["status"];
  priority: CareTask["priority"];
  isOverdue: boolean;
}

function getPatientStatus(patient: PatientListItemView): PatientStatus {
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

function getTaskStatusConfig(task: TaskWorkflowItem) {
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

function toTaskWorkflowItems(tasks: CareTask[], patientNameMap: Map<string, string>): TaskWorkflowItem[] {
  return tasks.map((task) => ({
    id: task.id,
    patientName: patientNameMap.get(task.patientId) ?? "未关联患者",
    title: task.title,
    remindTimeLabel: getCareTaskTimeLabel(task),
    repeatRuleLabel: careTaskRepeatRuleLabels[task.repeatRule],
    priorityLabel: careTaskPriorityLabels[task.priority],
    status: task.status,
    priority: task.priority,
    isOverdue: isCareTaskOverdue(task),
  }));
}

export function CareWorkflowPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CareTab>("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientListItemView[]>([]);
  const [records, setRecords] = useState<RecordListItemView[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadWorkflowData(showSuccess = false) {
    setIsLoading(true);
    setError(null);
    try {
      const [nextPatients, nextRecords, nextTasks] = await Promise.all([
        listPatients(),
        listCareRecords(),
        listCareTasks(),
      ]);
      setPatients(nextPatients.map(toPatientListItemView));
      setRecords(nextRecords);
      setTasks(nextTasks);
      if (showSuccess) {
        toast.success("数据已刷新");
      }
    } catch {
      setError("照护管理数据加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkflowData();
  }, []);

  const patientNameMap = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient.name])),
    [patients],
  );
  const taskItems = useMemo(() => toTaskWorkflowItems(tasks, patientNameMap), [patientNameMap, tasks]);

  async function handleCompleteTask(taskId: string) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)),
    );

    try {
      await completeCareTask(taskId);
      toast.success(`已完成「${currentTask.title}」`);
    } catch {
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? currentTask : task)));
      toast.error("任务完成失败，请稍后重试");
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      !searchQuery ||
      patient.name.includes(searchQuery) ||
      patient.profileNote.includes(searchQuery),
  );
  const filteredRecords = records.filter(
    (record) =>
      !searchQuery ||
      record.patientName.includes(searchQuery) ||
      record.title.includes(searchQuery) ||
      record.description.includes(searchQuery),
  );
  const filteredTasks = taskItems.filter(
    (task) =>
      !searchQuery ||
      task.patientName.includes(searchQuery) ||
      task.title.includes(searchQuery),
  );

  const pendingTaskCount = taskItems.filter((task) => task.status !== "completed").length;
  const tabs: { key: CareTab; label: string; icon: typeof Users; count: number }[] = [
    { key: "patients", label: "患者", icon: Users, count: patients.length },
    { key: "records", label: "记录", icon: ClipboardList, count: records.length },
    { key: "tasks", label: "任务", icon: CheckSquare, count: pendingTaskCount },
  ];
  const addAction =
    activeTab === "patients"
      ? { label: "添加患者", path: "/patients/new" }
      : activeTab === "records"
        ? { label: "新增记录", path: "/records/new" }
        : { label: "新增任务", path: "/tasks/new" };

  return (
    <PullToRefresh
      onRefresh={() => loadWorkflowData(true)}
      className="min-h-screen bg-background"
    >
      <Toaster position="top-center" richColors />
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

        <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-2xl mb-0.5">{patients.length}</div>
            <div className="text-white/70 text-xs">管理患者</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl mb-0.5">{records.length}</div>
            <div className="text-white/70 text-xs">护理记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-0.5">{pendingTaskCount}</div>
            <div className="text-white/70 text-xs">待办任务</div>
          </div>
        </div>
      </div>

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
            正在加载照护数据...
          </div>
        ) : error ? (
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <p className="text-sm text-accent mb-3">{error}</p>
            <button
              onClick={() => void loadWorkflowData()}
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
                        <span className="truncate">{patient.overviewLabel}</span>
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
        ) : null}

        {!isLoading && !error && activeTab === "records" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">共 {filteredRecords.length} 条记录</p>
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
                      <h3 className="font-medium text-sm">{record.title}</h3>
                      <span className="text-xs text-muted-foreground">{record.timeLabel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">患者：{record.patientName}</p>
                    <p className="text-sm text-foreground/80 mb-2">{record.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        record.isAiGenerated ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {record.sourceLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-chart-2/10 text-chart-2">
                        {record.statusLabel}
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
        ) : null}

        {!isLoading && !error && activeTab === "tasks" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                {filteredTasks.filter((task) => task.status !== "completed").length} 项待完成
              </p>
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
                <div
                  key={task.id}
                  className={`bg-card rounded-2xl p-4 border transition-colors ${
                    task.priority === "high" ? "border-accent/30" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bgClass}`}>
                      <StatusIcon className={`w-5 h-5 ${status.colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h3>
                          {task.priority === "high" ? (
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">
                              {task.priorityLabel}
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
                          {task.remindTimeLabel}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 rounded-lg">
                          {task.repeatRuleLabel !== "仅一次" ? <RefreshCw className="w-3 h-3" /> : null}
                          {task.repeatRuleLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.status !== "completed" ? (
                    <button
                      onClick={() => void handleCompleteTask(task.id)}
                      className="w-full mt-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      标记完成
                    </button>
                  ) : null}
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
        ) : null}
      </div>
    </PullToRefresh>
  );
}
