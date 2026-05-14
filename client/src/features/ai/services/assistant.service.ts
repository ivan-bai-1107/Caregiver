import type { AIAssistantRequest, AIAssistantResponse } from "@/entities/ai/model";
import { env } from "@/shared/constants/env";
import { apiClient } from "@/shared/lib/apiClient";
import { getAuthToken } from "@/shared/lib/auth";

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

interface StreamEnvelope {
  type?: "start" | "delta" | "done";
  data?: unknown;
}

export async function sendAssistantMessageStream(
  payload: AIAssistantRequest,
  onDelta: (text: string) => void,
) {
  const token = getAuthToken();
  const response = await fetch(`${env.apiBaseUrl}/api/ai/assistant/stream`, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error("AI 助手暂时不可用，请稍后重试。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResponse: AIAssistantResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const eventText of events) {
      const dataLine = eventText
        .split("\n")
        .find((line) => line.startsWith("data:"));
      if (!dataLine) {
        continue;
      }

      const envelope = JSON.parse(dataLine.slice(5).trim()) as StreamEnvelope;
      if (envelope.type === "delta" && typeof envelope.data === "string") {
        onDelta(envelope.data);
      }
      if (envelope.type === "done" && envelope.data && typeof envelope.data === "object") {
        finalResponse = envelope.data as AIAssistantResponse;
      }
    }
  }

  if (!finalResponse) {
    throw new Error("AI 助手响应不完整，请稍后重试。");
  }

  return finalResponse;
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
