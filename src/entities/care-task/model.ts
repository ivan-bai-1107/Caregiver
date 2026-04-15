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
