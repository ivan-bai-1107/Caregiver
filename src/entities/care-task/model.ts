import { formatDateTimeLocalValue } from "../../shared/lib/date";

export type CareTaskType =
  | "blood_pressure"
  | "blood_sugar"
  | "medication"
  | "diet"
  | "rehab"
  | "appointment"
  | "nutrition"
  | "other";

export type CareTaskRepeatRule = "once" | "daily" | "weekly" | "monthly";

export type CareTaskPriority = "low" | "normal" | "high";

export type CareTaskStatus = "pending" | "completed" | "scheduled";

export interface CareTask {
  id: string;
  patientId: string;
  title: string;
  description: string;
  taskType: CareTaskType;
  remindTime: string;
  repeatRule: CareTaskRepeatRule;
  priority: CareTaskPriority;
  remindOffsetMinutes: number;
  status: CareTaskStatus;
}

export interface CareTaskSummary {
  id: string;
  patientId: string;
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

export interface CareTaskDraft {
  patientId: string;
  title: string;
  description: string;
  taskType: CareTaskType | "";
  remindTime: string;
  repeatRule: CareTaskRepeatRule;
  priority: CareTaskPriority;
  remindOffsetMinutes: number;
  status: CareTaskStatus;
}

export type CareTaskDraftFieldPath =
  | "patientId"
  | "title"
  | "description"
  | "taskType"
  | "remindTime"
  | "repeatRule"
  | "priority"
  | "remindOffsetMinutes"
  | "status";

export interface CareTaskDraftValidationResult {
  isValid: boolean;
  fieldErrors: Partial<Record<CareTaskDraftFieldPath, string>>;
  messages: string[];
}

export function createEmptyCareTaskDraft(
  initialDraft: Partial<CareTaskDraft> = {},
): CareTaskDraft {
  return {
    patientId: initialDraft.patientId ?? "",
    title: initialDraft.title ?? "",
    description: initialDraft.description ?? "",
    taskType: initialDraft.taskType ?? "",
    remindTime: initialDraft.remindTime ?? formatDateTimeLocalValue(new Date()),
    repeatRule: initialDraft.repeatRule ?? "once",
    priority: initialDraft.priority ?? "normal",
    remindOffsetMinutes: initialDraft.remindOffsetMinutes ?? 15,
    status: initialDraft.status ?? "pending",
  };
}

export function validateCareTaskDraft(
  draft: CareTaskDraft,
): CareTaskDraftValidationResult {
  const fieldErrors: CareTaskDraftValidationResult["fieldErrors"] = {};
  const messages: string[] = [];

  if (!draft.patientId) {
    fieldErrors.patientId = "请选择关联患者";
    messages.push("请选择关联患者");
  }

  if (!draft.taskType) {
    fieldErrors.taskType = "请选择任务类型";
    messages.push("请选择任务类型");
  }

  if (!draft.title.trim()) {
    fieldErrors.title = "请输入任务标题";
    messages.push("请输入任务标题");
  }

  if (!draft.remindTime) {
    fieldErrors.remindTime = "请选择首次提醒时间";
    messages.push("请选择首次提醒时间");
  }

  if (draft.remindOffsetMinutes < 0 || Number.isNaN(draft.remindOffsetMinutes)) {
    fieldErrors.remindOffsetMinutes = "提醒时间必须为 0 或正整数";
    messages.push("提醒时间必须为 0 或正整数");
  }

  return {
    isValid: messages.length === 0,
    fieldErrors,
    messages,
  };
}
