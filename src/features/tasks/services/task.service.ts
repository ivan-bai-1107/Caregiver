import { careTaskMocks } from "@/entities/care-task/mock";

export async function listCareTasks() {
  return Promise.resolve(careTaskMocks);
}
