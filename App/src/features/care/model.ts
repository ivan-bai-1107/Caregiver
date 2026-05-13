import type { CareTaskPriority, CareTaskRepeatRule, CareTaskStatus, CareTaskType } from "@/entities/care-task/model";
import type { RecordType } from "@/entities/care-record/model";
import type { PatientGender } from "@/entities/patient/model";

export interface CareWorkbenchSummary {
  patientCount: number;
  recordCount: number;
  pendingTaskCount: number;
  overdueTaskCount: number;
}

export interface CareWorkbenchPatient {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  profileNote: string;
}

export interface CareWorkbenchRecord {
  id: string;
  patientId: string;
  patientName: string;
  recordType: RecordType;
  occurredAt: string;
  notes: string;
  source: string;
  valueText: string;
}

export interface CareWorkbenchTask {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  taskType: CareTaskType;
  remindTime: string;
  repeatRule: CareTaskRepeatRule;
  priority: CareTaskPriority;
  remindOffsetMinutes: number;
  status: CareTaskStatus;
  isOverdue: boolean;
}

export interface CareWorkbench {
  summary: CareWorkbenchSummary;
  patients: CareWorkbenchPatient[];
  recentRecords: CareWorkbenchRecord[];
  upcomingTasks: CareWorkbenchTask[];
}

export type CareWorkbenchTab = "patients" | "records" | "tasks";
