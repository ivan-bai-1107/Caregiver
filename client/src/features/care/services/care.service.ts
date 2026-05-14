import { apiClient } from "@/shared/lib/apiClient";
import type { CareWorkbench } from "@/features/care/model";
import { completeCareTask } from "@/features/tasks/services/task.service";

export async function getCareWorkbench() {
  return apiClient.get<CareWorkbench>("/api/care/workbench");
}

export async function completeCareWorkbenchTask(taskId: string) {
  return completeCareTask(taskId);
}
