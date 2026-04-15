import { getCareTaskTimeLabel } from "../../../entities/care-task/mapper";
import { mockCareTasks } from "../../../entities/care-task/mock";
import { mockPatients } from "../../../entities/patient/mock";
import type {
  HomeHealthAlert,
  HomePageData,
  HomeSummary,
  HomeTaskItem,
  RecentPatientCard,
} from "../model";

const healthAlertSeeds = [
  {
    id: "alert-1",
    patientId: "1",
    message: "血压连续 3 天偏高，建议重点关注。",
    timeLabel: "2小时前",
    severity: "warning" as const,
  },
  {
    id: "alert-2",
    patientId: "2",
    message: "今日空腹血糖波动接近阈值，建议补充复测。",
    timeLabel: "30分钟前",
    severity: "info" as const,
  },
];

const recentPatientSeeds: Array<Omit<RecentPatientCard, "name" | "age">> = [
  {
    patientId: "1",
    conditionSummary: "高血压重点观察",
    status: "attention",
    lastActivityLabel: "2小时前更新记录",
  },
  {
    patientId: "2",
    conditionSummary: "血糖管理跟进",
    status: "stable",
    lastActivityLabel: "1小时前查看任务",
  },
  {
    patientId: "3",
    conditionSummary: "康复训练连续记录",
    status: "improving",
    lastActivityLabel: "昨天新增记录",
  },
];

function createHomeTaskItem(taskId: string): HomeTaskItem | null {
  const task = mockCareTasks.find((item) => item.id === taskId);

  if (!task) {
    return null;
  }

  const patient = mockPatients.find((item) => item.id === task.patientId);

  if (!patient) {
    return null;
  }

  return {
    id: task.id,
    patientId: task.patientId,
    patientName: patient.name,
    title: task.title,
    remindTimeLabel: getCareTaskTimeLabel(task),
    status: task.status,
    priority: task.priority,
  };
}

function createHealthAlert(seed: (typeof healthAlertSeeds)[number]): HomeHealthAlert | null {
  const patient = mockPatients.find((item) => item.id === seed.patientId);

  if (!patient) {
    return null;
  }

  return {
    id: seed.id,
    patientId: seed.patientId,
    patientName: patient.name,
    message: seed.message,
    timeLabel: seed.timeLabel,
    severity: seed.severity,
  };
}

function createRecentPatientCard(
  seed: (typeof recentPatientSeeds)[number]
): RecentPatientCard | null {
  const patient = mockPatients.find((item) => item.id === seed.patientId);

  if (!patient) {
    return null;
  }

  return {
    patientId: patient.id,
    name: patient.name,
    age: patient.age,
    conditionSummary: seed.conditionSummary,
    status: seed.status,
    lastActivityLabel: seed.lastActivityLabel,
  };
}

function buildSummary(taskItems: HomeTaskItem[], healthAlerts: HomeHealthAlert[]): HomeSummary {
  const pendingTaskCount = taskItems.filter((item) => item.status === "pending").length;
  const completedTaskCount = taskItems.filter((item) => item.status === "completed").length;

  return {
    pendingTaskCount,
    completedTaskCount,
    healthAlertCount: healthAlerts.length,
    taskReminderCount: pendingTaskCount,
  };
}

export function getHomePageData(): HomePageData {
  const taskItems = ["task-1", "task-2", "task-3"]
    .map(createHomeTaskItem)
    .filter((item): item is HomeTaskItem => item !== null);

  const healthAlerts = healthAlertSeeds
    .map(createHealthAlert)
    .filter((item): item is HomeHealthAlert => item !== null);

  const recentPatients = recentPatientSeeds
    .map(createRecentPatientCard)
    .filter((item): item is RecentPatientCard => item !== null);

  return {
    summary: buildSummary(taskItems, healthAlerts),
    healthAlerts,
    taskItems,
    recentPatients,
  };
}
