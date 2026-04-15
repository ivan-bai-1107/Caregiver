import {
  createEmptyCareTaskDraft,
  type CareTask,
  type CareTaskDraft,
} from "@/entities/care-task/model";
import { mockCareTasks } from "@/entities/care-task/mock";
import { mockPatients } from "@/entities/patient/mock";
import { toPatientOption } from "@/entities/patient/mapper";
import type { TaskFormBootstrap } from "@/features/tasks/model";

let taskStore: CareTask[] = [...mockCareTasks];

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const taskReferenceTime = new Date("2026-04-15T17:30:00+08:00");

export async function listCareTasks() {
  await delay();
  return taskStore.map((task) => ({ ...task }));
}

export async function completeCareTask(taskId: string) {
  await delay(180);

  taskStore = taskStore.map((task) =>
    task.id === taskId ? { ...task, status: "completed" } : task,
  );

  return taskStore.find((task) => task.id === taskId) ?? null;
}

export async function getTaskFormBootstrap(): Promise<TaskFormBootstrap> {
  await delay(180);

  return {
    availablePatients: mockPatients.map(toPatientOption),
  };
}

export async function createCareTask(draft: CareTaskDraft) {
  await delay(220);

  const createdTask: CareTask = {
    ...createEmptyCareTaskDraft(draft),
    id: `task-${Date.now()}`,
  };

  taskStore = [createdTask, ...taskStore];

  return createdTask;
}
