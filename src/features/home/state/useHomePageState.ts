import { useEffect, useMemo, useState } from "react";
import type { HomePageData } from "../model";
import { getHomePageData } from "../services/home.service";
import { completeCareTask } from "@/features/tasks/services/task.service";

export function useHomePageState() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [taskItems, setTaskItems] = useState<HomePageData["taskItems"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeData() {
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await getHomePageData();
      setHomeData(nextData);
      setTaskItems(nextData.taskItems);
    } catch (loadError) {
      setError("首页数据加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadHomeData();
  }, []);

  const summary = useMemo(() => {
    const pendingTaskCount = taskItems.filter((item) => item.status === "pending").length;
    const completedTaskCount = taskItems.filter((item) => item.status === "completed").length;

    return {
      pendingTaskCount,
      completedTaskCount,
      healthAlertCount: homeData?.healthAlerts.length ?? 0,
      taskReminderCount: pendingTaskCount,
    };
  }, [homeData?.healthAlerts.length, taskItems]);

  const completeTask = async (taskId: string) => {
    const currentTask = taskItems.find((task) => task.id === taskId);
    if (!currentTask) {
      return null;
    }

    setTaskItems((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );

    try {
      await completeCareTask(taskId);
    } catch (completeError) {
      setTaskItems((previousTasks) =>
        previousTasks.map((task) => (task.id === taskId ? currentTask : task))
      );
      throw completeError;
    }

    return currentTask;
  };

  const refresh = async () => {
    await loadHomeData();
  };

  return {
    isLoading,
    error,
    summary,
    healthAlerts: homeData?.healthAlerts ?? [],
    taskItems,
    recentPatients: homeData?.recentPatients ?? [],
    completeTask,
    refresh,
    retry: loadHomeData,
  };
}
