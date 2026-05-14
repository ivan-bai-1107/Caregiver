import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Sparkles, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { appRoutes } from "@/shared/constants/routes";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskFilterTabs } from "@/features/tasks/components/TaskFilterTabs";
import { TaskListEmptyState } from "@/features/tasks/components/TaskListEmptyState";
import { TaskSummaryPanel } from "@/features/tasks/components/TaskSummaryPanel";
import { useTaskListState } from "@/features/tasks/state/useTaskListState";

export function TaskListPage() {
  const navigate = useNavigate();
  const {
    items,
    summary,
    filterTabs,
    activeFilter,
    setActiveFilter,
    isLoading,
    error,
    retry,
    completeTask,
    patientFilterId,
    patientFilterLabel,
    clearPatientFilter,
  } = useTaskListState();

  async function handleComplete(taskId: string) {
    try {
      const task = await completeTask(taskId);
      if (task) {
        toast.success(`已完成「${task.title}」`);
      }
    } catch (completeError) {
      toast.error("任务状态更新失败，请稍后重试。");
    }
  }

  return (
    <div className="mobile-fixed-page bg-background">
      <Toaster position="top-center" richColors />

      <div className="mobile-fixed-page-header rounded-b-[2rem] bg-gradient-to-br from-primary to-primary/80 px-6 pb-6 pt-12 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2" aria-label="返回上一页" type="button">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              护理任务
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm backdrop-blur-sm"
              onClick={() => navigate(appRoutes.aiAssistant)}
            >
              <Sparkles className="h-4 w-4" />
              AI创建
            </button>
            <button
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm backdrop-blur-sm"
              onClick={() =>
                navigate(
                  patientFilterId
                    ? appRoutes.newTaskForPatient(patientFilterId)
                    : appRoutes.taskNew,
                )
              }
            >
              <Plus className="h-4 w-4" />
              新增
            </button>
          </div>
        </div>

        <TaskSummaryPanel summary={summary} />
      </div>

      <div className="mobile-fixed-page-body">
        <TaskFilterTabs
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          tabs={filterTabs}
        />

      <div className="space-y-3 px-6 py-6">
        {patientFilterLabel ? (
          <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <span className="text-foreground/80">
              正在查看「{patientFilterLabel}」的护理任务
            </span>
            <button
              className="flex items-center gap-1 rounded-xl px-2 py-1 text-primary transition-colors hover:bg-primary/10"
              onClick={clearPatientFilter}
              type="button"
            >
              <X className="h-4 w-4" />
              清除
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            护理任务加载中...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">任务列表加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <TaskListEmptyState
            description={
              activeFilter === "all"
                ? "当前没有可展示的护理任务，后续可从任务表单或 AI 助手继续补充。"
                : "当前筛选条件下暂无匹配任务，可以切换其他状态标签查看。"
            }
            title={activeFilter === "all" ? "暂无护理任务" : "当前筛选下暂无任务"}
          />
        ) : null}

        {!isLoading && !error
          ? items.map((task) => (
              <TaskCard key={task.id} onComplete={handleComplete} task={task} />
            ))
          : null}
      </div>
      </div>
    </div>
  );
}
