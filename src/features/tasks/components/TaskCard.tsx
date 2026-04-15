import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { TaskListItemView } from "@/features/tasks/model";

interface TaskCardProps {
  task: TaskListItemView;
  onComplete: (taskId: string) => void;
}

function getTaskStatusConfig(task: TaskListItemView) {
  if (task.displayStatus === "done") {
    return {
      icon: CheckCircle2,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      badgeClass: "bg-primary/10 text-primary",
    };
  }

  if (task.displayStatus === "overdue") {
    return {
      icon: AlertCircle,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      badgeClass: "bg-accent/10 text-accent",
    };
  }

  return {
    icon: Clock,
    colorClass: "text-chart-2",
    bgClass: "bg-chart-2/10",
    badgeClass: "bg-chart-2/10 text-chart-2",
  };
}

function getPriorityClassName(priority: TaskListItemView["priority"]) {
  switch (priority) {
    case "high":
      return "bg-accent/10 text-accent";
    case "normal":
      return "bg-primary/10 text-primary";
    case "low":
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const statusConfig = getTaskStatusConfig(task);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-2xl border bg-card p-4 transition-colors ${
        task.displayStatus === "overdue" ? "border-accent/30" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${statusConfig.bgClass}`}
        >
          <StatusIcon className={`h-5 w-5 ${statusConfig.colorClass}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <div className="mb-0.5 flex items-center gap-2">
                <h3
                  className={`text-sm font-medium ${
                    task.displayStatus === "done"
                      ? "text-muted-foreground line-through"
                      : ""
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${getPriorityClassName(task.priority)}`}
                >
                  {task.priorityLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">患者：{task.patientName}</p>
            </div>
            <span
              className={`flex-shrink-0 rounded-lg px-2 py-0.5 text-xs ${statusConfig.badgeClass}`}
            >
              {task.statusLabel}
            </span>
          </div>

          {task.description ? (
            <p className="mb-2 mt-1.5 text-xs text-muted-foreground">{task.description}</p>
          ) : null}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{task.remindTimeLabel}</span>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-0.5">
              {task.isRecurring ? (
                <RefreshCw className="h-3 w-3" />
              ) : (
                <CalendarClock className="h-3 w-3" />
              )}
              <span>{task.repeatRuleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {task.displayStatus !== "done" ? (
        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 text-sm text-primary transition-colors hover:bg-primary/20"
          onClick={() => onComplete(task.id)}
        >
          <CheckCircle2 className="h-4 w-4" />
          标记为已完成
        </button>
      ) : null}
    </div>
  );
}
