import type { CareTaskPriority, CareTaskStatus } from "../../entities/care-task/model";
import type { BloodPressureTrendPoint } from "../../entities/trend/mapper";
import type { Patient } from "../../entities/patient/model";

export type PatientDetailTab = "info" | "records" | "tasks" | "trend";

export interface PatientOverviewStats {
  recordCount: number;
  pendingTaskCount: number;
  trendWindowDays: number;
}

export interface PatientRecentRecordItem {
  id: string;
  title: string;
  valueLabel: string;
  timeLabel: string;
  sourceLabel: string;
  isAiGenerated: boolean;
  statusLabel: string;
}

export interface PatientUpcomingTaskItem {
  id: string;
  title: string;
  timeLabel: string;
  status: CareTaskStatus;
  repeatRuleLabel: string;
  priority: CareTaskPriority;
}

export interface PatientTrendPreview {
  metricKey: "blood_pressure";
  chartData: BloodPressureTrendPoint[];
  averageSystolic: number;
  averageDiastolic: number;
  changePercent: number;
  summaryText: string;
  insightText: string;
}

export interface PatientDetailView {
  patient: Patient;
  conditionSummary: string;
  overview: PatientOverviewStats;
  recentRecords: PatientRecentRecordItem[];
  upcomingTasks: PatientUpcomingTaskItem[];
  trendPreview: PatientTrendPreview;
}
