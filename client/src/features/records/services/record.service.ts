import {
  recordSourceLabels,
  recordTypeLabels,
  recordTypeOptions,
  toCareMetrics,
} from "@/entities/care-record/mapper";
import type {
  CareMetric,
  CareRecord,
  CareRecordDraft,
  CareRecordSource,
  RecordType,
} from "@/entities/care-record/model";
import { type Patient } from "@/entities/patient/model";
import { getPatientOptions, listPatients } from "@/features/patients/services/patient.service";
import { apiClient } from "@/shared/lib/apiClient";
import { formatDateTimeLabel } from "@/shared/lib/date";

interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

interface CareRecordListQuery {
  patientId?: string;
  recordType?: RecordType;
  page?: number;
  pageSize?: number;
}

interface CareMetricDto {
  key?: string;
  value?: number | string;
  unit?: string;
}

interface CareRecordDto {
  id?: string;
  patientId?: string;
  recordType?: string;
  occurredAt?: string;
  notes?: string;
  source?: string;
  metrics?: CareMetricDto[];
}

export interface RecordListItemView {
  id: string;
  patientId: string;
  patientName: string;
  recordType: RecordType;
  title: string;
  description: string;
  timeLabel: string;
  sourceLabel: string;
  isAiGenerated: boolean;
  statusLabel: string;
}

function toRecordType(value?: string): RecordType {
  switch (value) {
    case "blood_pressure":
    case "temperature":
    case "blood_sugar":
    case "heart_rate":
    case "medication":
    case "diet":
    case "other":
      return value;
    default:
      return "other";
  }
}

function toRecordSource(value?: string): CareRecordSource {
  return value === "ai" ? "ai" : "manual";
}

function toMetric(dto: CareMetricDto): CareMetric {
  return {
    key: String(dto.key ?? "observationText") as CareMetric["key"],
    value: dto.value ?? "",
    unit: typeof dto.unit === "string" ? dto.unit : undefined,
  };
}

function toCareRecord(dto: CareRecordDto): CareRecord {
  return {
    id: String(dto.id ?? ""),
    patientId: String(dto.patientId ?? ""),
    recordType: toRecordType(dto.recordType),
    occurredAt: String(dto.occurredAt ?? new Date().toISOString()),
    notes: String(dto.notes ?? ""),
    source: toRecordSource(dto.source),
    metrics: Array.isArray(dto.metrics) ? dto.metrics.map(toMetric) : [],
  };
}

function getRecordDescription(record: CareRecord) {
  switch (record.recordType) {
    case "blood_pressure": {
      const systolic = record.metrics.find((metric) => metric.key === "bloodPressureSystolic")?.value;
      const diastolic = record.metrics.find((metric) => metric.key === "bloodPressureDiastolic")?.value;
      return `收缩压 ${systolic ?? "--"} / 舒张压 ${diastolic ?? "--"}`;
    }
    case "temperature":
      return `${record.metrics.find((metric) => metric.key === "temperature")?.value ?? "--"} °C`;
    case "blood_sugar":
      return `${record.metrics.find((metric) => metric.key === "bloodSugar")?.value ?? "--"} mmol/L`;
    case "heart_rate":
      return `${record.metrics.find((metric) => metric.key === "heartRate")?.value ?? "--"} bpm`;
    case "medication":
      return record.metrics.map((metric) => metric.value).join(" ");
    case "diet":
      return String(record.metrics.find((metric) => metric.key === "dietDescription")?.value ?? record.notes);
    case "other":
      return String(record.metrics.find((metric) => metric.key === "observationText")?.value ?? record.notes);
    default:
      return record.notes;
  }
}

function toPatientNameMap(patients: Patient[]) {
  return new Map(patients.map((patient) => [patient.id, patient.name]));
}

export async function getRecordFormBootstrap() {
  const availablePatients = await getPatientOptions();

  return {
    availablePatients,
    recordTypes: recordTypeOptions,
  };
}

export async function getCareRecord(recordId: string) {
  const response = await apiClient.get<CareRecordDto>(`/api/care-records/${recordId}`);
  return toCareRecord(response);
}

export async function submitRecordDraft(draft: CareRecordDraft, source: CareRecordSource = "manual") {
  const response = await apiClient.post<CareRecordDto>("/api/care-records", {
    patientId: draft.patientId,
    recordType: draft.recordType,
    occurredAt: draft.occurredAt,
    notes: draft.notes,
    source,
    metrics: toCareMetrics(draft),
  });

  return toCareRecord(response);
}

export async function updateCareRecord(recordId: string, draft: CareRecordDraft) {
  const response = await apiClient.put<CareRecordDto>(`/api/care-records/${recordId}`, {
    patientId: draft.patientId,
    recordType: draft.recordType,
    occurredAt: draft.occurredAt,
    notes: draft.notes,
    source: "manual",
    metrics: toCareMetrics(draft),
  });

  return toCareRecord(response);
}

export async function listCareRecords(params: CareRecordListQuery = {}) {
  const [response, patients] = await Promise.all([
    apiClient.get<PagedResponse<CareRecordDto>>("/api/care-records", params),
    listPatients(),
  ]);
  const patientNameMap = toPatientNameMap(patients);

  return (response.items ?? []).map((item) => {
    const record = toCareRecord(item);
    const patientName = patientNameMap.get(record.patientId) ?? "未关联患者";

    return {
      id: record.id,
      patientId: record.patientId,
      patientName,
      recordType: record.recordType,
      title: recordTypeLabels[record.recordType],
      description: getRecordDescription(record),
      timeLabel: formatDateTimeLabel(record.occurredAt),
      sourceLabel: recordSourceLabels[record.source],
      isAiGenerated: record.source === "ai",
      statusLabel: "已确认",
    } satisfies RecordListItemView;
  });
}
