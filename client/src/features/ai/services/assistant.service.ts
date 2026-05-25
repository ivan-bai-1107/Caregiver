import type {
  AIAssistantRequest,
  AIAssistantResponse,
  AIConversationDetail,
  AIConversationSummary,
} from "@/entities/ai/model";
import { env } from "@/shared/constants/env";
import { apiClient } from "@/shared/lib/apiClient";
import { getAuthToken } from "@/shared/lib/auth";

export const aiDraftStorageKey = "care-app-ai-confirm-draft";
export const aiChatSnapshotStorageKey = "care-app-ai-chat-snapshot";

export interface StoredAIDraft {
  draftType: Exclude<AIAssistantResponse["draftType"], null>;
  draftPayload: NonNullable<AIAssistantResponse["draftPayload"]>;
  answerText: string;
  riskNote: string;
}

export interface StoredAIChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  intent?: AIAssistantResponse["intent"];
  draftType?: AIAssistantResponse["draftType"];
  draftPayload?: AIAssistantResponse["draftPayload"];
  sources?: string[];
  riskNote?: string;
  generatedBy?: string;
}

export interface StoredAIChatSnapshot {
  conversationId: string | null;
  messages: StoredAIChatMessage[];
}

export async function sendAssistantMessage(payload: AIAssistantRequest) {
  return apiClient.post<AIAssistantResponse>("/api/ai/assistant", payload);
}

export async function listAssistantHistory(limit = 30) {
  return apiClient.get<AIConversationSummary[]>("/api/ai/assistant/history", { limit });
}

export async function getAssistantHistory(conversationId: string) {
  return apiClient.get<AIConversationDetail>(`/api/ai/assistant/history/${conversationId}`);
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
    if (parsed.draftType !== "record" && parsed.draftType !== "task" && parsed.draftType !== "patient") {
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

export function storeAIChatSnapshot(snapshot: StoredAIChatSnapshot) {
  sessionStorage.setItem(aiChatSnapshotStorageKey, JSON.stringify(snapshot));
}

export function readStoredAIChatSnapshot(): StoredAIChatSnapshot | null {
  const rawValue = sessionStorage.getItem(aiChatSnapshotStorageKey);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredAIChatSnapshot>;
    if (!Array.isArray(parsed.messages)) {
      return null;
    }
    return {
      conversationId: typeof parsed.conversationId === "string" ? parsed.conversationId : null,
      messages: parsed.messages.filter(
        (message): message is StoredAIChatMessage =>
          Boolean(message) &&
          (message.role === "user" || message.role === "ai") &&
          typeof message.id === "string" &&
          typeof message.content === "string" &&
          typeof message.timestamp === "string",
      ),
    };
  } catch {
    return null;
  }
}

export function clearStoredAIChatSnapshot() {
  sessionStorage.removeItem(aiChatSnapshotStorageKey);
}
