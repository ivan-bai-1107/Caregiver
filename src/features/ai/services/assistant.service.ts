import { aiAssistantMocks } from "@/entities/ai/mock";

export async function listAssistantResponses() {
  return Promise.resolve(aiAssistantMocks);
}
