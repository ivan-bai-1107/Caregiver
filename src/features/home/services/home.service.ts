import type { CareTaskPriority, CareTaskStatus } from "@/entities/care-task/model";
import { apiClient } from "@/shared/lib/apiClient";
import { formatRelativeScheduleLabel } from "@/shared/lib/date";
import type {
  HomeHealthAlert,
  HomePageData,
  HomeSummary,
  HomeTaskItem,
  RecentPatientCard,
} from "@/features/home/model";

interface HomeSummaryDto {
  pendingTaskCount?: number;
  completedTaskCount?: number;
  healthAlertCount?: number;
  taskReminderCount?: number;
}

interface HomeHealthAlertDto {
  id?: string;
  patientId?: string;
  patientName?: string;
  message?: string;
  severity?: string;
  occurredAt?: string;
}

interface HomeTaskItemDto {
  id?: string;
  patientId?: string;
  patientName?: string;
  title?: string;
  remindTime?: string;
  status?: string;
  priority?: string;
}

interface RecentPatientCardDto {
  patientId?: string;
  name?: string;
  age?: number;
  conditionSummary?: string;
  status?: string;
  lastActivityAt?: string;
}

interface HomeSummaryResponse {
  summary?: HomeSummaryDto;
  healthAlerts?: HomeHealthAlertDto[];
  taskItems?: HomeTaskItemDto[];
  recentPatients?: RecentPatientCardDto[];
}

function toTaskStatus(status?: string): CareTaskStatus {
  if (status === "completed" || status === "scheduled") {
    return status;
  }

  return "pending";
}

function toTaskPriority(priority?: string): CareTaskPriority {
  if (priority === "low" || priority === "high") {
    return priority;
  }

  return "normal";
}

function toSeverity(value?: string): HomeHealthAlert["severity"] {
  return value === "warning" ? "warning" : "info";
}

function toPatientCardStatus(value?: string): RecentPatientCard["status"] {
  if (value === "attention" || value === "improving") {
    return value;
  }

  return "stable";
}

function mapSummary(summary?: HomeSummaryDto): HomeSummary {
  return {
    pendingTaskCount: Number(summary?.pendingTaskCount ?? 0),
    completedTaskCount: Number(summary?.completedTaskCount ?? 0),
    healthAlertCount: Number(summary?.healthAlertCount ?? 0),
    taskReminderCount: Number(summary?.taskReminderCount ?? 0),
  };
}

function mapHealthAlert(alert: HomeHealthAlertDto): HomeHealthAlert {
  return {
    id: String(alert.id ?? ""),
    patientId: String(alert.patientId ?? ""),
    patientName: String(alert.patientName ?? "未关联患者"),
    message: String(alert.message ?? ""),
    timeLabel: alert.occurredAt ? formatRelativeScheduleLabel(alert.occurredAt) : "刚刚",
    severity: toSeverity(alert.severity),
  };
}

function mapTaskItem(item: HomeTaskItemDto): HomeTaskItem {
  return {
    id: String(item.id ?? ""),
    patientId: String(item.patientId ?? ""),
    patientName: String(item.patientName ?? "未关联患者"),
    title: String(item.title ?? ""),
    remindTimeLabel: item.remindTime ? formatRelativeScheduleLabel(item.remindTime) : "待安排",
    status: toTaskStatus(item.status),
    priority: toTaskPriority(item.priority),
  };
}

function mapRecentPatient(item: RecentPatientCardDto): RecentPatientCard {
  return {
    patientId: String(item.patientId ?? ""),
    name: String(item.name ?? "未命名患者"),
    age: Number(item.age ?? 0),
    conditionSummary: String(item.conditionSummary ?? "待补充护理说明"),
    status: toPatientCardStatus(item.status),
    lastActivityLabel: item.lastActivityAt
      ? `${formatRelativeScheduleLabel(item.lastActivityAt)}更新`
      : "最近暂无动态",
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  const response = await apiClient.get<HomeSummaryResponse>("/api/home/summary");

  return {
    summary: mapSummary(response.summary),
    healthAlerts: (response.healthAlerts ?? []).map(mapHealthAlert),
    taskItems: (response.taskItems ?? []).map(mapTaskItem),
    recentPatients: (response.recentPatients ?? []).map(mapRecentPatient),
  };
}
