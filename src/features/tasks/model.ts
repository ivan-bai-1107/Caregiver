import type { CareTask } from "@/entities/care-task/model";

export interface TaskListViewItem extends CareTask {
  patientName: string;
}
