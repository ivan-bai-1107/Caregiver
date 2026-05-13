import { useEffect, useState } from "react";
import {
  careTaskPriorityLabels,
  careTaskRepeatRuleLabels,
  getCareTaskTimeLabel,
  toCareTaskSummary,
} from "@/entities/care-task/mapper";
import type { CareTask } from "@/entities/care-task/model";
import { listPatients } from "@/features/patients/services/patient.service";
import type {
  TaskDisplayStatus,
  TaskFilterTab,
  TaskListFilter,
  TaskListItemView,
  TaskListSummary,
} from "@/features/tasks/model";
import {
  completeCareTask,
  listCareTasks,
  taskReferenceTime,
} from "@/features/tasks/services/task.service";

function getTaskDisplayStatus(task: TaskListItemView): TaskDisplayStatus {
  if (task.status === "completed") {
    return "done";
  }

  if (task.isOverdue) {
    return "overdue";
  }

  return "pending";
}

function toTaskListItemView(task: CareTask, patientNameMap: Map<string, string>): TaskListItemView {
  const summary = toCareTaskSummary(task, taskReferenceTime);
  const patientName = patientNameMap.get(task.patientId) ?? "未关联患者";
  const displayStatus = getTaskDisplayStatus({
    ...summary,
    patientName,
    remindTimeLabel: "",
    repeatRuleLabel: "",
    priorityLabel: "",
    statusLabel: "",
    displayStatus: "pending",
    isRecurring: false,
  });

  return {
    ...summary,
    patientName,
    remindTimeLabel: getCareTaskTimeLabel(task),
    repeatRuleLabel: careTaskRepeatRuleLabels[task.repeatRule],
    priorityLabel: careTaskPriorityLabels[task.priority],
    statusLabel:
      displayStatus === "done"
        ? "已完成"
        : displayStatus === "overdue"
          ? "已逾期"
          : "待执行",
    displayStatus,
    isRecurring: task.repeatRule !== "once",
  };
}

function buildTaskListSummary(items: TaskListItemView[]): TaskListSummary {
  return {
    pendingCount: items.filter((item) => item.displayStatus === "pending").length,
    doneCount: items.filter((item) => item.displayStatus === "done").length,
    overdueCount: items.filter((item) => item.displayStatus === "overdue").length,
  };
}

function buildTaskFilterTabs(summary: TaskListSummary, totalCount: number): TaskFilterTab[] {
  return [
    { value: "all", label: "全部", count: totalCount },
    { value: "pending", label: "待执行", count: summary.pendingCount },
    { value: "overdue", label: "已逾期", count: summary.overdueCount },
    { value: "done", label: "已完成", count: summary.doneCount },
  ];
}

function filterTaskItems(items: TaskListItemView[], filter: TaskListFilter) {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.displayStatus === filter);
}

export function useTaskListState() {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [patientNameMap, setPatientNameMap] = useState<Map<string, string>>(new Map());
  const [activeFilter, setActiveFilter] = useState<TaskListFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextTasks, patients] = await Promise.all([listCareTasks(), listPatients()]);
      setTasks(nextTasks);
      setPatientNameMap(new Map(patients.map((patient) => [patient.id, patient.name])));
    } catch (loadError) {
      setError("护理任务加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function completeTask(taskId: string) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return null;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task,
      ),
    );

    try {
      await completeCareTask(taskId);
    } catch (completeError) {
      setTasks((previousTasks) =>
        previousTasks.map((task) => (task.id === taskId ? currentTask : task)),
      );
      throw completeError;
    }

    return currentTask;
  }

  const items = tasks.map((task) => toTaskListItemView(task, patientNameMap));
  const summary = buildTaskListSummary(items);
  const filterTabs = buildTaskFilterTabs(summary, items.length);
  const filteredItems = filterTaskItems(items, activeFilter);

  return {
    items: filteredItems,
    summary,
    filterTabs,
    activeFilter,
    setActiveFilter,
    isLoading,
    error,
    retry: loadTasks,
    completeTask,
  };
}
