import { formatDateTimeLocalValue } from "../../shared/lib/date";

export type RecordType =
  | "blood_pressure"
  | "temperature"
  | "blood_sugar"
  | "heart_rate"
  | "medication"
  | "diet"
  | "other";

export type CareRecordSource = "manual" | "ai";

export type CareMetricKey =
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "temperature"
  | "bloodSugar"
  | "heartRate"
  | "medicationName"
  | "medicationDose"
  | "dietDescription"
  | "observationText";

export interface CareMetric {
  key: CareMetricKey;
  value: number | string;
  unit?: string;
}

export interface CareRecord {
  id: string;
  patientId: string;
  recordType: RecordType;
  occurredAt: string;
  notes: string;
  source: CareRecordSource;
  metrics: CareMetric[];
}

export interface CareMetricDraft {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  temperature: string;
  bloodSugar: string;
  heartRate: string;
  medicationName: string;
  medicationDose: string;
  dietDescription: string;
  observationText: string;
}

export interface CareRecordDraft {
  patientId: string;
  recordType: RecordType | "";
  occurredAt: string;
  notes: string;
  metrics: CareMetricDraft;
}

type MetricDraftKey = keyof CareMetricDraft;

export type RecordDraftFieldPath =
  | "patientId"
  | "recordType"
  | "occurredAt"
  | "notes"
  | `metrics.${MetricDraftKey}`;

export interface RecordDraftValidationResult {
  isValid: boolean;
  messages: string[];
  fieldErrors: Partial<Record<RecordDraftFieldPath, string>>;
}

export const emptyCareMetricDraft: CareMetricDraft = {
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  temperature: "",
  bloodSugar: "",
  heartRate: "",
  medicationName: "",
  medicationDose: "",
  dietDescription: "",
  observationText: "",
};

export function createEmptyRecordDraft(
  initialDraft: Partial<CareRecordDraft> = {}
): CareRecordDraft {
  return {
    patientId: initialDraft.patientId ?? "",
    recordType: initialDraft.recordType ?? "",
    occurredAt: initialDraft.occurredAt ?? formatDateTimeLocalValue(new Date()),
    notes: initialDraft.notes ?? "",
    metrics: {
      ...emptyCareMetricDraft,
      ...initialDraft.metrics,
    },
  };
}

export function validateRecordDraft(draft: CareRecordDraft): RecordDraftValidationResult {
  const fieldErrors: RecordDraftValidationResult["fieldErrors"] = {};
  const messages: string[] = [];

  if (!draft.patientId) {
    fieldErrors.patientId = "请选择患者";
    messages.push("请选择关联患者");
  }

  if (!draft.recordType) {
    fieldErrors.recordType = "请选择记录类型";
    messages.push("请选择记录类型");
  }

  if (!draft.occurredAt) {
    fieldErrors.occurredAt = "请选择记录时间";
    messages.push("请选择记录时间");
  }

  switch (draft.recordType) {
    case "blood_pressure":
      if (!draft.metrics.bloodPressureSystolic) {
        fieldErrors["metrics.bloodPressureSystolic"] = "请输入收缩压";
        messages.push("请输入收缩压");
      }
      if (!draft.metrics.bloodPressureDiastolic) {
        fieldErrors["metrics.bloodPressureDiastolic"] = "请输入舒张压";
        messages.push("请输入舒张压");
      }
      break;
    case "temperature":
      if (!draft.metrics.temperature) {
        fieldErrors["metrics.temperature"] = "请输入体温";
        messages.push("请输入体温");
      }
      break;
    case "blood_sugar":
      if (!draft.metrics.bloodSugar) {
        fieldErrors["metrics.bloodSugar"] = "请输入血糖值";
        messages.push("请输入血糖值");
      }
      break;
    case "heart_rate":
      if (!draft.metrics.heartRate) {
        fieldErrors["metrics.heartRate"] = "请输入心率";
        messages.push("请输入心率");
      }
      break;
    case "medication":
      if (!draft.metrics.medicationName) {
        fieldErrors["metrics.medicationName"] = "请输入药品名称";
        messages.push("请输入药品名称");
      }
      break;
    case "diet":
      if (!draft.metrics.dietDescription) {
        fieldErrors["metrics.dietDescription"] = "请输入饮食内容";
        messages.push("请输入饮食内容");
      }
      break;
    case "other":
      if (!draft.metrics.observationText) {
        fieldErrors["metrics.observationText"] = "请输入状态描述";
        messages.push("请输入状态描述");
      }
      break;
    default:
      break;
  }

  return {
    isValid: messages.length === 0,
    messages,
    fieldErrors,
  };
}
