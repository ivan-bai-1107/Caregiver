import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import type { HomeTaskItem } from "../model";

interface HomeTaskSectionProps {
  tasks: HomeTaskItem[];
  onViewAll: () => void;
  onCompleteTask: (taskId: string, title: string) => void;
}

export function HomeTaskSection({
  tasks,
  onViewAll,
  onCompleteTask,
}: HomeTaskSectionProps) {
  return (
    <div className="px-6 mt-8">
      <SectionHeader
        title="今日任务提醒"
        action={
          <button onClick={onViewAll} className="flex items-center gap-1 text-sm text-primary">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        }
      />
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                task.status === "completed" ? "bg-primary/10" : "bg-muted"
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
                  {task.title}
                </span>
                <span className="text-xs text-muted-foreground">{task.remindTimeLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground">患者：{task.patientName}</p>
            </div>
            {task.status !== "completed" ? (
              <button
                onClick={() => onCompleteTask(task.id, task.title)}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs flex-shrink-0"
              >
                完成
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
