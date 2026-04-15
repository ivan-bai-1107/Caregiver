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
  const { summary, healthAlerts, taskItems, recentPatients, completeTask, refresh } =
    useHomePageState();

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

      <HomeTaskSection
        tasks={taskItems}
        onViewAll={() => navigate(appRoutes.tasks)}
        onCompleteTask={(taskId, title) => {
          completeTask(taskId);
          toast.success(`已完成「${title}」`);
        }}
      />

      <RecentPatientsSection
        patients={recentPatients}
        onViewAll={() => navigate(appRoutes.patients)}
        onOpenPatient={(patientId) => navigate(appRoutes.patientDetail(patientId))}
        onAddPatient={() => navigate(appRoutes.newPatient)}
      />
    </PullToRefresh>
  );
}
