import type { HomeSummary } from "../model";

interface HomeSummaryCardProps {
  summary: HomeSummary;
}

export function HomeSummaryCard({ summary }: HomeSummaryCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <p className="text-white/70 text-xs mb-3 uppercase tracking-wide">今日护理概览</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl mb-0.5">{summary.pendingTaskCount}</div>
          <div className="text-white/70 text-xs">待完成任务</div>
        </div>
        <div className="text-center border-x border-white/20">
          <div className="text-2xl mb-0.5">{summary.completedTaskCount}</div>
          <div className="text-white/70 text-xs">已完成任务</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-0.5">{summary.healthAlertCount}</div>
          <div className="text-white/70 text-xs">异常提醒</div>
        </div>
      </div>
    </div>
  );
}
