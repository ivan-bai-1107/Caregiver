import { formatRelativeScheduleLabel } from "../../shared/lib/date";
import type {
  CareTask,
  CareTaskPriority,
  CareTaskRepeatRule,
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

export function getCareTaskTimeLabel(task: Pick<CareTask, "remindTime">) {
  return formatRelativeScheduleLabel(task.remindTime);
}
