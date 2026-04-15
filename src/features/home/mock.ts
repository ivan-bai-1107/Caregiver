import type { HomeHealthAlert, HomePatientStatus } from "@/features/home/model";

export const homePatientMetaById: Record<
  string,
  { conditionSummary: string; status: HomePatientStatus }
> = {
  "1": { conditionSummary: "高血压", status: "attention" },
  "2": { conditionSummary: "糖尿病", status: "stable" },
  "3": { conditionSummary: "康复期", status: "improving" },
  "4": { conditionSummary: "心血管风险观察", status: "stable" },
};

export const homeHealthAlertMocks: HomeHealthAlert[] = [
  {
    id: "alert-1",
    patientId: "1",
    patientName: "张明",
    message: "血压连续 3 天偏高，建议持续关注晨间波动。",
    timeLabel: "2小时前",
    severity: "warning",
  },
  {
    id: "alert-2",
    patientId: "2",
    patientName: "李华",
    message: "今日空腹血糖略高，建议复核餐后用药与饮食记录。",
    timeLabel: "30分钟前",
    severity: "info",
  },
];
