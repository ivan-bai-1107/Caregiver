export type AIIntent = "qa" | "care_record" | "care_task" | "care_patient" | "form_prefill";

export type AIDraftType = "record" | "task" | "patient" | null;

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
  generatedBy?: string;
}

export interface AIHistoryMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  intent?: AIIntent | null;
  draftType?: AIDraftType;
  draftPayload?: AIDraftPayload;
  sources?: string[];
  riskNote?: string | null;
  generatedBy?: string | null;
}

export interface AIConversationSummary {
  conversationId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
}

export interface AIConversationDetail {
  conversationId: string;
  title: string;
  messages: AIHistoryMessage[];
}
