export type AIIntent = "qa" | "care_record" | "care_task" | "form_prefill";

export type AIDraftType = "record" | "task" | null;

export type AIDraftPayload = Record<string, unknown> | null;

export interface AIAssistantRequest {
  message: string;
  conversationId: string | null;
}

export interface AIAssistantResponse {
  conversationId: string;
  intent: AIIntent;
  answerText: string;
  draftType: AIDraftType;
  draftPayload: AIDraftPayload;
  sources: string[];
  riskNote: string;
}
