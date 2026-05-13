import type {
  CareTask,
  CareTaskDraft,
  CareTaskPriority,
  CareTaskRepeatRule,
  CareTaskStatus,
  CareTaskType,
} from "@/entities/care-task/model";
import { getPatientOptions } from "@/features/patients/services/patient.service";
import type { TaskFormBootstrap } from "@/features/tasks/model";
import { apiClient } from "@/shared/lib/apiClient";

interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

interface CareTaskDto {
  id?: string;
  patientId?: string;
  title?: string;
  description?: string;
  taskType?: string;
  remindTime?: string;
  repeatRule?: string;
  priority?: string;
  remindOffsetMinutes?: number;
  status?: string;
}

export const taskReferenceTime = new Date("2026-04-15T17:30:00+08:00");

function toTaskType(value?: string): CareTaskType {
  switch (value) {
    case "blood_pressure":
    case "blood_sugar":
    case "medication":
    case "diet":
    case "rehab":
    case "appointment":
    case "nutrition":
    case "other":
      return value;
    default:
      return "other";
  }
}

function toRepeatRule(value?: string): CareTaskRepeatRule {
  switch (value) {
    case "daily":
    case "weekly":
    case "monthly":
      return value;
    default:
      return "once";
  }
}

function toPriority(value?: string): CareTaskPriority {
  if (value === "low" || value === "high") {
    return value;
  }

  return "normal";
}

function toStatus(value?: string): CareTaskStatus {
  if (value === "completed" || value === "scheduled") {
    return value;
  }

  return "pending";
}

function toCareTask(dto: CareTaskDto): CareTask {
  return {
    id: String(dto.id ?? ""),
    patientId: String(dto.patientId ?? ""),
    title: String(dto.title ?? ""),
    description: String(dto.description ?? ""),
    taskType: toTaskType(dto.taskType),
    remindTime: String(dto.remindTime ?? new Date().toISOString()),
    repeatRule: toRepeatRule(dto.repeatRule),
    priority: toPriority(dto.priority),
    remindOffsetMinutes: Number(dto.remindOffsetMinutes ?? 0),
    status: toStatus(dto.status),
  };
}

export async function listCareTasks() {
  const response = await apiClient.get<PagedResponse<CareTaskDto>>("/api/tasks");
  return (response.items ?? []).map(toCareTask);
}

export async function getCareTask(taskId: string) {
  const response = await apiClient.get<CareTaskDto>(`/api/tasks/${taskId}`);
  return toCareTask(response);
}

export async function completeCareTask(taskId: string) {
  const response = await apiClient.post<CareTaskDto>(`/api/tasks/${taskId}/complete`, {});
  return toCareTask(response);
}

export async function getTaskFormBootstrap(): Promise<TaskFormBootstrap> {
  return {
    availablePatients: await getPatientOptions(),
  };
}

export async function createCareTask(draft: CareTaskDraft) {
  const response = await apiClient.post<CareTaskDto>("/api/tasks", {
    patientId: draft.patientId,
    title: draft.title,
    description: draft.description,
    taskType: draft.taskType,
    remindTime: draft.remindTime,
    repeatRule: draft.repeatRule,
    priority: draft.priority,
    remindOffsetMinutes: draft.remindOffsetMinutes,
    status: draft.status,
  });

  return toCareTask(response);
}

export async function updateCareTask(taskId: string, draft: CareTaskDraft) {
  const response = await apiClient.put<CareTaskDto>(`/api/tasks/${taskId}`, {
    patientId: draft.patientId,
    title: draft.title,
    description: draft.description,
    taskType: draft.taskType,
    remindTime: draft.remindTime,
    repeatRule: draft.repeatRule,
    priority: draft.priority,
    remindOffsetMinutes: draft.remindOffsetMinutes,
    status: draft.status,
  });

  return toCareTask(response);
}
