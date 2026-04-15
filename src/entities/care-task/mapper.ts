import { formatRelativeScheduleLabel } from "../../shared/lib/date";
import type {
  CareTask,
  CareTaskPriority,
  CareTaskRepeatRule,
  CareTaskSummary,
  CareTaskStatus,
  CareTaskType,
} from "./model";

export const careTaskTypeLabels: Record<CareTaskType, string> = {
  blood_pressure: "测量血压",
  blood_sugar: "测量血糖",
  medication: "按时用药",
  diet: "饮食观察",
  rehab: "康复训练",
  appointment: "复诊预约",
  nutrition: "营养评估",
  other: "其他任务",
};

export const careTaskRepeatRuleLabels: Record<CareTaskRepeatRule, string> = {
  once: "仅一次",
  daily: "每天",
  weekly: "每周",
  monthly: "每月",
};

export const careTaskStatusLabels: Record<CareTaskStatus, string> = {
  pending: "待完成",
  completed: "已完成",
  scheduled: "已安排",
};

export const careTaskPriorityLabels: Record<CareTaskPriority, string> = {
  low: "普通",
  normal: "重要",
  high: "紧急",
};

export const careTaskTypeOptions = [
  { value: "blood_pressure" as const, label: "测量血压" },
  { value: "blood_sugar" as const, label: "测量血糖" },
  { value: "medication" as const, label: "按时用药" },
  { value: "diet" as const, label: "饮食观察" },
  { value: "rehab" as const, label: "康复训练" },
  { value: "appointment" as const, label: "复诊预约" },
  { value: "nutrition" as const, label: "营养评估" },
  { value: "other" as const, label: "其他任务" },
];

export const careTaskRepeatRuleOptions = [
  { value: "once" as const, label: "仅一次", desc: "执行一次后自动结束" },
  { value: "daily" as const, label: "每天", desc: "每天重复执行" },
  { value: "weekly" as const, label: "每周", desc: "每周同一天重复" },
  { value: "monthly" as const, label: "每月", desc: "每月同一日期重复" },
];

export const careTaskPriorityOptions = [
  { value: "low" as const, label: "普通" },
  { value: "normal" as const, label: "重要" },
  { value: "high" as const, label: "紧急" },
];

export const careTaskReminderOffsetOptions = [
  { value: 0, label: "不提醒" },
  { value: 15, label: "提前15分钟" },
  { value: 30, label: "提前30分钟" },
  { value: 60, label: "提前1小时" },
  { value: 1440, label: "提前1天" },
];

export function getCareTaskTimeLabel(task: Pick<CareTask, "remindTime">) {
  return formatRelativeScheduleLabel(task.remindTime);
}

export function isCareTaskOverdue(
  task: Pick<CareTask, "status" | "remindTime">,
  referenceTime = new Date(),
) {
  if (task.status === "completed") {
    return false;
  }

  return new Date(task.remindTime).getTime() < referenceTime.getTime();
}

export function toCareTaskSummary(
  task: CareTask,
  referenceTime = new Date(),
): CareTaskSummary {
  return {
    id: task.id,
    patientId: task.patientId,
    title: task.title,
    description: task.description,
    taskType: task.taskType,
    remindTime: task.remindTime,
    repeatRule: task.repeatRule,
    priority: task.priority,
    remindOffsetMinutes: task.remindOffsetMinutes,
    status: task.status,
    isOverdue: isCareTaskOverdue(task, referenceTime),
  };
}
