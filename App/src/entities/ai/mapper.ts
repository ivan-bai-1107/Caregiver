import type { AIDraftType, AIIntent } from "./model";

export const aiIntentLabels: Record<AIIntent, string> = {
  qa: "护理问答",
  care_record: "护理记录",
  care_task: "护理任务",
  form_prefill: "表单预填",
};

export const aiDraftTypeLabels: Record<Exclude<AIDraftType, null>, string> = {
  record: "护理记录草稿",
  task: "护理任务草稿",
};
