import { formatRelativeScheduleLabel } from "../../shared/lib/date";
import type {
  CareMetric,
  CareMetricDraft,
  CareRecord,
  CareRecordDraft,
  CareRecordSource,
  CareMetricKey,
  RecordType,
} from "./model";

export const recordTypeLabels: Record<RecordType, string> = {
  blood_pressure: "血压测量",
  temperature: "体温测量",
  blood_sugar: "血糖测量",
  heart_rate: "心率监测",
  medication: "用药记录",
  diet: "饮食记录",
  other: "状态观察",
};

export const recordSourceLabels: Record<CareRecordSource, string> = {
  manual: "手动记录",
  ai: "AI生成",
};

export interface RecordTypeOption {
  value: RecordType;
  label: string;
  category: string;
}

export const recordTypeOptions: RecordTypeOption[] = [
  { value: "blood_pressure", label: "血压测量", category: "生命体征" },
  { value: "temperature", label: "体温测量", category: "生命体征" },
  { value: "blood_sugar", label: "血糖测量", category: "生命体征" },
  { value: "heart_rate", label: "心率监测", category: "生命体征" },
  { value: "medication", label: "用药记录", category: "用药记录" },
  { value: "diet", label: "饮食记录", category: "饮食记录" },
  { value: "other", label: "状态观察", category: "状态观察" },
];

function findMetric(metrics: CareMetric[], key: CareMetricKey) {
  return metrics.find((metric) => metric.key === key)?.value;
}

function toNumberMetric(value: string, unit: string, key: CareMetricKey): CareMetric {
  return {
    key,
    value: Number(value),
    unit,
  };
}

export function toCareMetrics(draft: CareRecordDraft): CareMetric[] {
  const metrics: CareMetric[] = [];

  switch (draft.recordType) {
    case "blood_pressure":
      if (draft.metrics.bloodPressureSystolic) {
        metrics.push(
          toNumberMetric(draft.metrics.bloodPressureSystolic, "mmHg", "bloodPressureSystolic")
        );
      }
      if (draft.metrics.bloodPressureDiastolic) {
        metrics.push(
          toNumberMetric(draft.metrics.bloodPressureDiastolic, "mmHg", "bloodPressureDiastolic")
        );
      }
      break;
    case "temperature":
      if (draft.metrics.temperature) {
        metrics.push(toNumberMetric(draft.metrics.temperature, "°C", "temperature"));
      }
      break;
    case "blood_sugar":
      if (draft.metrics.bloodSugar) {
        metrics.push(toNumberMetric(draft.metrics.bloodSugar, "mmol/L", "bloodSugar"));
      }
      break;
    case "heart_rate":
      if (draft.metrics.heartRate) {
        metrics.push(toNumberMetric(draft.metrics.heartRate, "bpm", "heartRate"));
      }
      break;
    case "medication":
      if (draft.metrics.medicationName) {
        metrics.push({ key: "medicationName", value: draft.metrics.medicationName });
      }
      if (draft.metrics.medicationDose) {
        metrics.push({ key: "medicationDose", value: draft.metrics.medicationDose });
      }
      break;
    case "diet":
      if (draft.metrics.dietDescription) {
        metrics.push({ key: "dietDescription", value: draft.metrics.dietDescription });
      }
      break;
    case "other":
      if (draft.metrics.observationText) {
        metrics.push({ key: "observationText", value: draft.metrics.observationText });
      }
      break;
    default:
      break;
  }

  return metrics;
}

export function getCareRecordValueLabel(record: CareRecord) {
  switch (record.recordType) {
    case "blood_pressure": {
      const systolic = findMetric(record.metrics, "bloodPressureSystolic");
      const diastolic = findMetric(record.metrics, "bloodPressureDiastolic");
      return `${systolic}/${diastolic} mmHg`;
    }
    case "temperature":
      return `${findMetric(record.metrics, "temperature")}°C`;
    case "blood_sugar":
      return `${findMetric(record.metrics, "bloodSugar")} mmol/L`;
    case "heart_rate":
      return `${findMetric(record.metrics, "heartRate")} bpm`;
    case "medication": {
      const name = findMetric(record.metrics, "medicationName");
      const dose = findMetric(record.metrics, "medicationDose");
      return [name, dose].filter(Boolean).join(" ");
    }
    case "diet":
      return String(findMetric(record.metrics, "dietDescription") ?? "");
    case "other":
      return String(findMetric(record.metrics, "observationText") ?? "");
    default:
      return "";
  }
}

export function getCareRecordTimeLabel(record: Pick<CareRecord, "occurredAt">) {
  return formatRelativeScheduleLabel(record.occurredAt);
}

export interface RecordDraftPreview {
  title: string;
  value: string;
  helperText: string;
}

export function buildRecordDraftPreview(
  recordType: CareRecordDraft["recordType"],
  metrics: CareMetricDraft
): RecordDraftPreview | null {
  switch (recordType) {
    case "blood_pressure":
      if (!metrics.bloodPressureSystolic || !metrics.bloodPressureDiastolic) {
        return null;
      }
      return {
        title: "血压读数预览",
        value: `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic} mmHg`,
        helperText: "保留收缩压与舒张压双字段，便于后续趋势组合。",
      };
    case "temperature":
      if (!metrics.temperature) {
        return null;
      }
      return {
        title: "体温记录预览",
        value: `${metrics.temperature} °C`,
        helperText: "建议按固定时段记录，便于后续趋势对比。",
      };
    case "blood_sugar":
      if (!metrics.bloodSugar) {
        return null;
      }
      return {
        title: "血糖记录预览",
        value: `${metrics.bloodSugar} mmol/L`,
        helperText: "当前按单指标录入，后续趋势页仍按单指标请求拉取。",
      };
    case "heart_rate":
      if (!metrics.heartRate) {
        return null;
      }
      return {
        title: "心率记录预览",
        value: `${metrics.heartRate} bpm`,
        helperText: "可结合备注记录测量场景，如静息或活动后。",
      };
    case "medication":
      if (!metrics.medicationName) {
        return null;
      }
      return {
        title: "用药记录预览",
        value: [metrics.medicationName, metrics.medicationDose].filter(Boolean).join(" "),
        helperText: "药品名称进入结构化指标，补充说明保留在备注。",
      };
    case "diet":
      if (!metrics.dietDescription) {
        return null;
      }
      return {
        title: "饮食记录预览",
        value: metrics.dietDescription,
        helperText: "建议描述本次饮食内容与大致分量。",
      };
    case "other":
      if (!metrics.observationText) {
        return null;
      }
      return {
        title: "状态观察预览",
        value: metrics.observationText,
        helperText: "该类记录仍保留为事件层记录，避免混入不稳定结构字段。",
      };
    default:
      return null;
  }
}
