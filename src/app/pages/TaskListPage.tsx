import { useNavigate } from "react-router";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export function TaskListPage() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");

  const [tasks, setTasks] = useState([
    {
      id: 1,
      patient: "张明",
      title: "测量血压",
      time: "今天 09:00",
      status: "completed",
      priority: "normal",
      cycle: "每天",
      desc: "测量并记录收缩压和舒张压",
    },
    {
      id: 2,
      patient: "李华",
      title: "服药提醒",
      time: "今天 10:30",
      status: "pending",
      priority: "high",
      cycle: "每天",
      desc: "降糖药 1片，餐后服用",
    },
    {
      id: 3,
      patient: "王芳",
      title: "康复训练",
      time: "今天 14:00",
      status: "pending",
      priority: "normal",
      cycle: "每天",
      desc: "上肢康复训练，每次30分钟",
    },
    {
      id: 4,
      patient: "张明",
      title: "血糖检测",
      time: "今天 16:00",
      status: "pending",
      priority: "high",
      cycle: "每天",
      desc: "空腹血糖检测",
    },
    {
      id: 5,
      patient: "李华",
      title: "复诊预约",
      time: "明天 09:00",
      status: "scheduled",
      priority: "normal",
      cycle: "仅一次",
      desc: "内分泌科复诊，带好近期检查报告",
    },
    {
      id: 6,
      patient: "王芳",
      title: "营养评估",
      time: "本周五 10:00",
      status: "scheduled",
      priority: "normal",
      cycle: "每周",
      desc: "评估饮食和营养摄入情况",
    },
  ]);

  const handleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t))
    );
    const task = tasks.find((t) => t.id === id);
    toast.success(`已完成「${task?.title}」`);
  };

  const filterTabs = [
    { value: "all", label: "全部", count: tasks.length },
    { value: "pending", label: "待完成", count: tasks.filter((t) => t.status === "pending").length },
    { value: "completed", label: "已完成", count: tasks.filter((t) => t.status === "completed").length },
    { value: "scheduled", label: "已安排", count: tasks.filter((t) => t.status === "scheduled").length },
  ];

  const filteredTasks = tasks.filter(
    (task) => filterStatus === "all" || task.status === filterStatus
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle2, colorClass: "text-primary", bgClass: "bg-primary/10", label: "已完成" };
      case "pending":
        return { icon: Clock, colorClass: "text-accent", bgClass: "bg-accent/10", label: "待完成" };
      case "scheduled":
        return { icon: CalendarClock, colorClass: "text-chart-2", bgClass: "bg-chart-2/10", label: "已安排" };
      default:
        return { icon: Clock, colorClass: "text-muted-foreground", bgClass: "bg-muted", label: "未知" };
    }
  };

  const getCycleIcon = (cycle: string) => {
    if (cycle === "仅一次") return null;
    return <RefreshCw className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            护理任务
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/ai-assistant")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 rounded-xl backdrop-blur-sm text-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI创建
            </button>
            <button
              onClick={() => navigate("/tasks/new")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              新增
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-center">
            <div className="text-2xl mb-0.5">
              {tasks.filter((t) => t.status === "pending").length}
            </div>
            <div className="text-white/70 text-xs">待完成</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-2xl mb-0.5">
              {tasks.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-white/70 text-xs">已完成</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-0.5">
              {tasks.filter((t) => t.status === "scheduled").length}
            </div>
            <div className="text-white/70 text-xs">已安排</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                filterStatus === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filterStatus === tab.value
                    ? "bg-white/20"
                    : "bg-muted-foreground/20"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="px-6 py-6 space-y-3">
        {filteredTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const StatusIcon = statusConfig.icon;
          const cycleIcon = getCycleIcon(task.cycle);

          return (
            <div
              key={task.id}
              className={`bg-card rounded-2xl p-4 border transition-colors ${
                task.priority === "high" ? "border-accent/30" : "border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.bgClass}`}
                >
                  <StatusIcon className={`w-5 h-5 ${statusConfig.colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3
                          className={`font-medium text-sm ${
                            task.status === "completed" ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.priority === "high" && (
                          <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">
                            重要
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">患者：{task.patient}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        task.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : task.status === "pending"
                          ? "bg-accent/10 text-accent"
                          : "bg-chart-2/10 text-chart-2"
                      }`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  {task.desc && (
                    <p className="text-xs text-muted-foreground mt-1.5 mb-2">{task.desc}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.time}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-lg">
                      {cycleIcon}
                      <span>{task.cycle}</span>
                    </div>
                  </div>
                </div>
              </div>
              {task.status === "pending" && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="w-full mt-3 py-2.5 bg-primary/10 text-primary rounded-xl text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  标记为已完成
                </button>
              )}
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">暂无相关任务</p>
          </div>
        )}
      </div>
    </div>
  );
}