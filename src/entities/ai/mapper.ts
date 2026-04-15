import type { AIDraftType, AIIntent } from "./model";

export const aiIntentLabels: Record<AIIntent, string> = {
  create_record: "护理记录",
  create_task: "护理任务",
  create_patient: "患者信息",
  trend_summary: "趋势总结",
  general_support: "通用咨询",
};

export const aiDraftTypeLabels: Record<AIDraftType, string> = {
  care_record: "护理记录草稿",
  care_task: "护理任务草稿",
  patient: "患者草稿",
  none: "无结构化草稿",
};
