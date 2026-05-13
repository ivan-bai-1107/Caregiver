import type {
  CareTaskDraft,
  CareTaskPriority,
  CareTaskRepeatRule,
  CareTaskSummary,
  CareTaskType,
} from "@/entities/care-task/model";
import type { PatientOption } from "@/entities/patient/mapper";

export type TaskListFilter = "all" | "pending" | "overdue" | "done";

export type TaskDisplayStatus = "pending" | "overdue" | "done";

export interface TaskListSummary {
  pendingCount: number;
  doneCount: number;
  overdueCount: number;
}

export interface TaskFilterTab {
  value: TaskListFilter;
  label: string;
  count: number;
}

export interface TaskListItemView extends CareTaskSummary {
  patientName: string;
  remindTimeLabel: string;
  repeatRuleLabel: string;
  priorityLabel: string;
  statusLabel: string;
  displayStatus: TaskDisplayStatus;
  isRecurring: boolean;
}

export interface TaskListPageData {
  summary: TaskListSummary;
  filterTabs: TaskFilterTab[];
  items: TaskListItemView[];
}

export interface TaskFormBootstrap {
  availablePatients: PatientOption[];
}

export interface TaskFormState {
  draft: CareTaskDraft;
  availablePatients: PatientOption[];
  validationErrors: Record<string, string>;
  validationMessages: string[];
  isLoading: boolean;
  loadError: string | null;
  isSubmitting: boolean;
}
