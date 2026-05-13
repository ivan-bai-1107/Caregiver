import {
  careTaskPriorityLabels,
  careTaskRepeatRuleLabels,
  careTaskStatusLabels,
} from "@/entities/care-task/mapper";
import type {
  CareTaskPriority,
  CareTaskRepeatRule,
  CareTaskStatus,
} from "@/entities/care-task/model";
import {
  getCareRecordTimeLabel,
  getCareRecordValueLabel,
  recordSourceLabels,
  recordTypeLabels,
} from "@/entities/care-record/mapper";
import type {
  CareMetric,
  CareRecord,
  CareRecordSource,
  RecordType,
} from "@/entities/care-record/model";
import { toPatientOption } from "@/entities/patient/mapper";
import type { Patient, PatientGender } from "@/entities/patient/model";
import { getAverageTrendValue, type BloodPressureTrendPoint } from "@/entities/trend/mapper";
import { apiClient } from "@/shared/lib/apiClient";
import { formatDateTimeLocalValue, formatRelativeScheduleLabel } from "@/shared/lib/date";
import type {
  PatientDetailView,
  PatientOverviewStats,
  PatientRecentRecordItem,
  PatientTrendPreview,
  PatientUpcomingTaskItem,
} from "@/features/patients/model";

interface PagedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

interface PatientDto {
  id?: string;
  userId?: string;
  name?: string;
  age?: number;
  gender?: string;
  profileNote?: string;
}

interface PatientDashboardResponse {
  patient?: PatientDto;
  conditionSummary?: string;
  overview?: {
    recordCount?: number;
    pendingTaskCount?: number;
    trendWindowDays?: number;
  };
  recentRecords?: Array<{
    id?: string;
    recordType?: string;
    occurredAt?: string;
    source?: string;
    isConfirmed?: boolean;
    valueText?: string;
    notes?: string;
    metrics?: CareMetric[];
  }>;
  upcomingTasks?: Array<{
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
    patientName?: string;
    isOverdue?: boolean;
  }>;
  trendPreview?: {
    metricKey?: string;
    chartData?: Array<{
      date?: string;
      systolic?: number;
      diastolic?: number;
    }>;
    averageSystolic?: number;
    averageDiastolic?: number;
    changePercent?: number;
  };
}

export interface PatientListItemView {
  id: string;
  name: string;
  age: number;
  gender: PatientGender;
  profileNote: string;
  overviewLabel: string;
}

export interface PatientFormDraft {
  name: string;
  age: string;
  gender: PatientGender | "";
  profileNote: string;
}

export interface PatientFormValidation {
  isValid: boolean;
  fieldErrors: Partial<Record<keyof PatientFormDraft, string>>;
}

function toGender(gender?: string): PatientGender {
  if (gender === "女" || gender === "其他") {
    return gender;
  }

  return "男";
}

function toPatient(dto: PatientDto): Patient {
  return {
    id: String(dto.id ?? ""),
    userId: String(dto.userId ?? ""),
    name: String(dto.name ?? ""),
    age: Number(dto.age ?? 0),
    gender: toGender(dto.gender),
    profileNote: String(dto.profileNote ?? ""),
  };
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

function buildTrendSummary(chartData: BloodPressureTrendPoint[]) {
  if (chartData.length === 0) {
    return {
      summaryText: "当前暂无足够的血压趋势数据，后续记录接通后会在这里汇总变化情况。",
      insightText: "趋势页本轮只接 series 数据，深层 AI 分析暂不接入。",
    };
  }

  const first = chartData[0]?.systolic;
  const last = chartData[chartData.length - 1]?.systolic;

  if (typeof first === "number" && typeof last === "number") {
    const direction = last <= first ? "整体趋于平稳" : "近期略有上升";
    return {
      summaryText: `近 ${chartData.length} 次血压记录已接入，收缩压从 ${first} 变化到 ${last}，${direction}。`,
      insightText: "当前只保留结构化血压双线预览，后续完整趋势分析页再继续收口。",
    };
  }

  return {
    summaryText: "已接入血压双线趋势数据，但当前点位仍不足以形成稳定判断。",
    insightText: "建议继续保持收缩压与舒张压双字段录入，便于后续趋势页组合展示。",
  };
}

function mapRecentRecord(
  item: NonNullable<PatientDashboardResponse["recentRecords"]>[number],
): PatientRecentRecordItem {
  const record: CareRecord = {
    id: String(item.id ?? ""),
    patientId: "",
    recordType: toRecordType(item.recordType),
    occurredAt: String(item.occurredAt ?? new Date().toISOString()),
    notes: String(item.notes ?? ""),
    source: toRecordSource(item.source),
    metrics: Array.isArray(item.metrics) ? item.metrics : [],
  };
  const isAiGenerated = record.source === "ai";
  const valueLabel =
    item.valueText && item.valueText.trim()
      ? item.valueText
      : getCareRecordValueLabel(record);

  return {
    id: record.id,
    title: recordTypeLabels[record.recordType],
    valueLabel,
    timeLabel: getCareRecordTimeLabel(record),
    sourceLabel: recordSourceLabels[record.source],
    isAiGenerated,
    statusLabel: item.isConfirmed === false ? "待确认" : "已确认",
  };
}

function mapUpcomingTask(
  item: NonNullable<PatientDashboardResponse["upcomingTasks"]>[number],
): PatientUpcomingTaskItem {
  const status = toStatus(item.status);
  const repeatRule = toRepeatRule(item.repeatRule);
  const priority = toPriority(item.priority);

  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? ""),
    timeLabel: item.remindTime ? formatRelativeScheduleLabel(item.remindTime) : "待安排",
    status,
    repeatRuleLabel: careTaskRepeatRuleLabels[repeatRule],
    priority,
  };
}

function mapTrendPreview(
  trendPreview?: PatientDashboardResponse["trendPreview"],
): PatientTrendPreview {
  const chartData: BloodPressureTrendPoint[] = (trendPreview?.chartData ?? []).map((point) => ({
    date: String(point.date ?? ""),
    systolic: typeof point.systolic === "number" ? point.systolic : undefined,
    diastolic: typeof point.diastolic === "number" ? point.diastolic : undefined,
  }));
  const derived = buildTrendSummary(chartData);
  const averageSystolic =
    typeof trendPreview?.averageSystolic === "number"
      ? trendPreview.averageSystolic
      : getAverageTrendValue(chartData.map((point) => point.systolic));
  const averageDiastolic =
    typeof trendPreview?.averageDiastolic === "number"
      ? trendPreview.averageDiastolic
      : getAverageTrendValue(chartData.map((point) => point.diastolic));

  return {
    metricKey: "blood_pressure",
    chartData,
    averageSystolic,
    averageDiastolic,
    changePercent: Number(trendPreview?.changePercent ?? 0),
    summaryText: derived.summaryText,
    insightText: derived.insightText,
  };
}

export function createEmptyPatientFormDraft(patient?: Patient): PatientFormDraft {
  return {
    name: patient?.name ?? "",
    age: patient ? String(patient.age) : "",
    gender: patient?.gender ?? "",
    profileNote: patient?.profileNote ?? "",
  };
}

export function validatePatientFormDraft(draft: PatientFormDraft): PatientFormValidation {
  const fieldErrors: PatientFormValidation["fieldErrors"] = {};

  if (!draft.name.trim()) {
    fieldErrors.name = "请输入患者姓名";
  }

  if (!draft.age.trim()) {
    fieldErrors.age = "请输入患者年龄";
  }

  if (!draft.gender) {
    fieldErrors.gender = "请选择患者性别";
  }

  if (!draft.profileNote.trim()) {
    fieldErrors.profileNote = "请输入护理说明";
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export async function listPatients() {
  const response = await apiClient.get<PagedResponse<PatientDto>>("/api/patients");
  return (response.items ?? []).map(toPatient);
}

export async function getPatient(patientId: string) {
  const response = await apiClient.get<PatientDto>(`/api/patients/${patientId}`);
  return toPatient(response);
}

export async function createPatient(draft: PatientFormDraft) {
  const response = await apiClient.post<PatientDto>("/api/patients", {
    name: draft.name.trim(),
    age: Number(draft.age),
    gender: draft.gender,
    profileNote: draft.profileNote.trim(),
  });

  return toPatient(response);
}

export async function updatePatient(patientId: string, draft: PatientFormDraft) {
  const response = await apiClient.put<PatientDto>(`/api/patients/${patientId}`, {
    name: draft.name.trim(),
    age: Number(draft.age),
    gender: draft.gender,
    profileNote: draft.profileNote.trim(),
  });

  return toPatient(response);
}

export async function getPatientDashboard(patientId: string): Promise<PatientDetailView> {
  const response = await apiClient.get<PatientDashboardResponse>(`/api/patients/${patientId}/dashboard`);
  const patient = response.patient ? toPatient(response.patient) : await getPatient(patientId);
  const overview: PatientOverviewStats = {
    recordCount: Number(response.overview?.recordCount ?? 0),
    pendingTaskCount: Number(response.overview?.pendingTaskCount ?? 0),
    trendWindowDays:
      Number(response.overview?.trendWindowDays ?? response.trendPreview?.chartData?.length ?? 0),
  };

  return {
    patient,
    conditionSummary: String(response.conditionSummary ?? "待补充页面聚合病情说明"),
    overview,
    recentRecords: (response.recentRecords ?? []).map(mapRecentRecord),
    upcomingTasks: (response.upcomingTasks ?? []).map(mapUpcomingTask),
    trendPreview: mapTrendPreview(response.trendPreview),
  };
}

export async function getPatientOptions() {
  const patients = await listPatients();
  return patients.map(toPatientOption);
}

export function toPatientListItemView(patient: Patient): PatientListItemView {
  return {
    id: patient.id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    profileNote: patient.profileNote,
    overviewLabel: patient.profileNote.trim() || "护理说明待补充",
  };
}

export function toPatientFormDraftFromEntity(patient: Patient) {
  return {
    name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    profileNote: patient.profileNote,
  } satisfies PatientFormDraft;
}

export function getPatientFormSubmitNotice(isEdit: boolean) {
  return isEdit ? "患者信息已更新" : "患者添加成功";
}

export function getPatientFormRedirectTarget(patientId: string) {
  return patientId ? `/patients/${patientId}` : "/patients";
}

export function getPatientLastUpdatedLabel(date = new Date()) {
  return formatDateTimeLocalValue(date);
}
