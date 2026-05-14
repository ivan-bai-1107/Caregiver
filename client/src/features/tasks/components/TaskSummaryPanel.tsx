import type { TaskListSummary } from "@/features/tasks/model";

interface TaskSummaryPanelProps {
  summary: TaskListSummary;
}

export function TaskSummaryPanel({ summary }: TaskSummaryPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-center">
        <div className="mb-0.5 text-2xl">{summary.pendingCount}</div>
        <div className="text-xs text-white/70">待执行</div>
      </div>
      <div className="border-x border-white/20 text-center">
        <div className="mb-0.5 text-2xl">{summary.doneCount}</div>
        <div className="text-xs text-white/70">已完成</div>
      </div>
      <div className="text-center">
        <div className="mb-0.5 text-2xl">{summary.overdueCount}</div>
        <div className="text-xs text-white/70">已逾期</div>
      </div>
    </div>
  );
}
