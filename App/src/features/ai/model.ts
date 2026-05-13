import type { AIAssistantResponse } from "@/entities/ai/model";

export interface AIAssistantView extends AIAssistantResponse {
  canApplyDraft: boolean;
}
