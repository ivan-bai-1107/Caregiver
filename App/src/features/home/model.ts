import type { CareTaskPriority, CareTaskStatus } from "../../entities/care-task/model";

export interface HomeSummary {
  pendingTaskCount: number;
  completedTaskCount: number;
  healthAlertCount: number;
  taskReminderCount: number;
}

export interface HomeHealthAlert {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  timeLabel: string;
  severity: "warning" | "info";
}

export interface HomeTaskItem {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  remindTimeLabel: string;
  status: CareTaskStatus;
  priority: CareTaskPriority;
}

export interface RecentPatientCard {
  patientId: string;
  name: string;
  age: number;
  conditionSummary: string;
  status: "attention" | "stable" | "improving";
  lastActivityLabel: string;
}

export interface HomePageData {
  summary: HomeSummary;
  healthAlerts: HomeHealthAlert[];
  taskItems: HomeTaskItem[];
  recentPatients: RecentPatientCard[];
}
