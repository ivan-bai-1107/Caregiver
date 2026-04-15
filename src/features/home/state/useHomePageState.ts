import { useMemo, useState } from "react";
import type { HomePageData } from "../model";
import { getHomePageData } from "../services/mockHomeService";

export function useHomePageState() {
  const [homeData] = useState<HomePageData>(() => getHomePageData());
  const [taskItems, setTaskItems] = useState(homeData.taskItems);

  const summary = useMemo(() => {
    const pendingTaskCount = taskItems.filter((item) => item.status === "pending").length;
    const completedTaskCount = taskItems.filter((item) => item.status === "completed").length;

    return {
      pendingTaskCount,
      completedTaskCount,
      healthAlertCount: homeData.healthAlerts.length,
      taskReminderCount: pendingTaskCount,
    };
  }, [homeData.healthAlerts.length, taskItems]);

  const completeTask = (taskId: string) => {
    setTaskItems((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      )
    );
  };

  const refresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
  };

  return {
    summary,
    healthAlerts: homeData.healthAlerts,
    taskItems,
    recentPatients: homeData.recentPatients,
    completeTask,
    refresh,
  };
}
