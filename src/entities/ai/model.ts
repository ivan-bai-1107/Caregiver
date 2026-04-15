export type AIIntent =
  | "create_record"
  | "create_task"
  | "create_patient"
  | "trend_summary"
  | "general_support";

export type AIDraftType = "care_record" | "care_task" | "patient" | "none";

export type AIDraftPayload = Record<string, unknown> | null;

export interface AIAssistantResult {
  intent: AIIntent;
  answerText: string;
  draftType: AIDraftType;
  draftPayload: AIDraftPayload;
}
