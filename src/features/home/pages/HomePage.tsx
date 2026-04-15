import { useNavigate } from "react-router";
import { Toaster, toast } from "sonner";
import { appRoutes } from "../../../shared/constants/routes";
import { formatDashboardDate } from "../../../shared/lib/date";
import { PullToRefresh } from "../../../shared/ui/PullToRefresh";
import { HomeHealthAlertsSection } from "../components/HomeHealthAlertsSection";
import { HomeAiEntryCard } from "../components/HomeAiEntryCard";
import { HomeSummaryCard } from "../components/HomeSummaryCard";
import { HomeTaskSection } from "../components/HomeTaskSection";
import { RecentPatientsSection } from "../components/RecentPatientsSection";
import { useHomePageState } from "../state/useHomePageState";

export function HomePage() {
  const navigate = useNavigate();
  const {
    summary,
    healthAlerts,
    taskItems,
    recentPatients,
    completeTask,
    refresh,
    isLoading,
    error,
    retry,
  } = useHomePageState();

  return (
    <PullToRefresh
      onRefresh={async () => {
        await refresh();
        toast.success("数据已刷新");
      }}
      className="min-h-screen bg-background pb-8"
    >
      <Toaster position="top-center" richColors />

      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
              您好，护理员
            </h1>
            <p className="text-white/70 text-sm">{formatDashboardDate(new Date())}</p>
          </div>
        </div>

        <HomeSummaryCard summary={summary} />
        <HomeAiEntryCard onOpen={() => navigate(appRoutes.aiAssistant)} />
      </div>

      <HomeHealthAlertsSection alerts={healthAlerts} />

      {isLoading ? (
        <div className="px-6 py-6">
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            首页数据加载中...
          </div>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="px-6 py-6">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">工作台加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <HomeTaskSection
          tasks={taskItems}
          onViewAll={() => navigate(appRoutes.tasks)}
          onCompleteTask={async (taskId, title) => {
            try {
              await completeTask(taskId);
              toast.success(`已完成「${title}」`);
            } catch {
              toast.error("任务状态更新失败，请稍后重试。");
            }
          }}
        />
      ) : null}

      {!isLoading && !error ? (
        <RecentPatientsSection
          patients={recentPatients}
          onViewAll={() => navigate(appRoutes.patients)}
          onOpenPatient={(patientId) => navigate(appRoutes.patientDetail(patientId))}
          onAddPatient={() => navigate(appRoutes.newPatient)}
        />
      ) : null}
    </PullToRefresh>
  );
}
