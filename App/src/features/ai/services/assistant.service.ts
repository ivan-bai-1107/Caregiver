import type { AIAssistantRequest, AIAssistantResponse } from "@/entities/ai/model";
import { apiClient } from "@/shared/lib/apiClient";

export const aiDraftStorageKey = "care-app-ai-confirm-draft";

export interface StoredAIDraft {
  draftType: Exclude<AIAssistantResponse["draftType"], null>;
  draftPayload: NonNullable<AIAssistantResponse["draftPayload"]>;
  answerText: string;
  riskNote: string;
}

export async function sendAssistantMessage(payload: AIAssistantRequest) {
  return apiClient.post<AIAssistantResponse>("/api/ai/assistant", payload);
}

export function storeAIDraft(draft: StoredAIDraft) {
  sessionStorage.setItem(aiDraftStorageKey, JSON.stringify(draft));
}

export function readStoredAIDraft(): StoredAIDraft | null {
  const rawValue = sessionStorage.getItem(aiDraftStorageKey);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredAIDraft>;
    if (parsed.draftType !== "record" && parsed.draftType !== "task") {
      return null;
    }
    if (
      !parsed.draftPayload ||
      typeof parsed.draftPayload !== "object" ||
      Array.isArray(parsed.draftPayload)
    ) {
      return null;
    }
    if (typeof parsed.answerText !== "string" || typeof parsed.riskNote !== "string") {
      return null;
    }
    return parsed as StoredAIDraft;
  } catch {
    return null;
  }
}

export function clearStoredAIDraft() {
  sessionStorage.removeItem(aiDraftStorageKey);
}
