import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { PullToRefresh } from "../components/PullToRefresh";

export function HomePage() {
  const navigate = useNavigate();

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, patient: "张明", task: "测量血压", time: "09:00", status: "completed" },
    { id: 2, patient: "李华", task: "服药提醒", time: "10:30", status: "pending" },
    { id: 3, patient: "王芳", task: "康复训练", time: "14:00", status: "pending" },
  ]);

  const recentAlerts = [
    {
      id: 1,
      patient: "张明",
      message: "血压连续3天偏高，建议关注",
      time: "2小时前",
      type: "warning",
    },
    {
      id: 2,
      patient: "李华",
      message: "今日服药时间临近（10:30）",
      time: "30分钟前",
      type: "info",
    },
  ];

  const recentPatients = [
    { id: 1, name: "张明", age: 68, condition: "高血压", status: "attention" },
    { id: 2, name: "李华", age: 72, condition: "糖尿病", status: "stable" },
    { id: 3, name: "王芳", age: 65, condition: "康复期", status: "improving" },
  ];

  const pendingCount = todayTasks.filter((t) => t.status === "pending").length;
  const completedCount = todayTasks.filter((t) => t.status === "completed").length;
  const alertCount = recentAlerts.length;

  return (
    <PullToRefresh
      onRefresh={async () => {
        await new Promise((r) => setTimeout(r, 1200));
        toast.success("数据已刷新");
      }}
      className="min-h-screen bg-background pb-8"
    >
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
              您好，护理员
            </h1>
            <p className="text-white/70 text-sm">2026年4月15日 · 星期三</p>
          </div>
        </div>

        {/* Today Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-white/70 text-xs mb-3 uppercase tracking-wide">今日护理概览</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl mb-0.5">{pendingCount}</div>
              <div className="text-white/70 text-xs">待完成任务</div>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-2xl mb-0.5">{completedCount}</div>
              <div className="text-white/70 text-xs">已完成任务</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-0.5">{alertCount}</div>
              <div className="text-white/70 text-xs">异常提醒</div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {recentAlerts.length > 0 && (
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base">健康异常提醒</h2>
            <AlertCircle className="w-4 h-4 text-accent" />
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border ${
                  alert.type === "warning"
                    ? "bg-accent/5 border-accent/20"
                    : "bg-chart-2/5 border-chart-2/20"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                        alert.type === "warning" ? "bg-accent" : "bg-chart-2"
                      }`}
                    />
                    <span className="font-medium text-sm">{alert.patient}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <p className="text-sm text-foreground/80 ml-3.5">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base">今日任务</h2>
          <button
            onClick={() => navigate("/care")}
            className="flex items-center gap-1 text-sm text-primary"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  task.status === "completed"
                    ? "bg-primary/10"
                    : "bg-muted"
                }`}
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={`font-medium text-sm ${
                      task.status === "completed" ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.task}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">患者：{task.patient}</p>
              </div>
              {task.status === "pending" && (
                <button
                  onClick={() => {
                    setTodayTasks((prev) =>
                      prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t))
                    );
                    toast.success(`已完成「${task.task}」`);
                  }}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs flex-shrink-0"
                >
                  完成
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base">最近查看患者</h2>
          <button
            onClick={() => navigate("/care")}
            className="flex items-center gap-1 text-sm text-primary"
          >
            全部患者
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recentPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="bg-card rounded-2xl p-4 border border-border text-left hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {patient.name[0]}
                </div>
                <div
                  className={`w-2 h-2 rounded-full ml-auto ${
                    patient.status === "attention"
                      ? "bg-accent"
                      : patient.status === "improving"
                      ? "bg-chart-2"
                      : "bg-primary"
                  }`}
                />
              </div>
              <h3 className="font-medium text-sm mb-0.5">{patient.name}</h3>
              <p className="text-xs text-muted-foreground">
                {patient.age}岁 · {patient.condition}
              </p>
            </button>
          ))}
          <button
            onClick={() => navigate("/patients/new")}
            className="bg-primary/5 rounded-2xl p-4 border border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-7 h-7 text-primary" />
            <span className="text-xs text-primary">添加患者</span>
          </button>
        </div>
      </div>
    </PullToRefresh>
  );
}