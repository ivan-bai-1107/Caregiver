import type { TrendMetric } from "@/entities/trend/model";
import { apiClient } from "@/shared/lib/apiClient";
import { formatMonthDayLabel } from "@/shared/lib/date";

interface TrendPointDto {
  occurredAt?: string;
  value?: number;
}

interface TrendSeriesResponse {
  patientId?: string;
  metricType?: string;
  points?: TrendPointDto[];
}

export interface MetricTrendPoint {
  date: string;
  value: number;
}

export interface MetricTrendSeries {
  patientId: string;
  metric: TrendMetric;
  points: MetricTrendPoint[];
}

export interface BloodPressureTrendSeries {
  patientId: string;
  points: Array<{
    date: string;
    systolic?: number;
    diastolic?: number;
  }>;
}

export interface TrendRangeQuery {
  startAt?: string;
  endAt?: string;
}

interface TrendAnalysisResponse {
  patientId?: string;
  metricType?: string;
  summary?: string;
  riskLevel?: "stable" | "attention" | "high" | string;
  highlights?: string[];
  suggestions?: string[];
  riskNote?: string;
  generatedBy?: string;
}

export interface TrendAnalysis {
  patientId: string;
  metric: TrendPageMetricKey;
  summary: string;
  riskLevel: "stable" | "attention" | "high";
  highlights: string[];
  suggestions: string[];
  riskNote: string;
  generatedBy: string;
}

export type TrendPageMetricKey = "blood_pressure" | "blood_sugar" | "temperature" | "heart_rate";

function mapMetricSeries(
  patientId: string,
  metric: TrendMetric,
  response: TrendSeriesResponse,
): MetricTrendSeries {
  return {
    patientId,
    metric,
    points: (response.points ?? []).map((point) => ({
      date: point.occurredAt ? formatMonthDayLabel(point.occurredAt) : "",
      value: Number(point.value ?? 0),
    })),
  };
}

export async function getMetricTrendSeries(
  patientId: string,
  metric: TrendMetric,
  range: TrendRangeQuery = {},
) {
  const response = await apiClient.get<TrendSeriesResponse>(
    `/api/patients/${patientId}/metrics/trend`,
    { metricType: metric, startAt: range.startAt, endAt: range.endAt },
  );

  return mapMetricSeries(patientId, metric, response);
}

export async function getBloodPressureTrendSeries(
  patientId: string,
  range: TrendRangeQuery = {},
): Promise<BloodPressureTrendSeries> {
  const [systolicSeries, diastolicSeries] = await Promise.all([
    getMetricTrendSeries(patientId, "bloodPressureSystolic", range),
    getMetricTrendSeries(patientId, "bloodPressureDiastolic", range),
  ]);
  const pointMap = new Map<string, BloodPressureTrendSeries["points"][number]>();

  systolicSeries.points.forEach((point) => {
    pointMap.set(point.date, {
      date: point.date,
      systolic: point.value,
    });
  });

  diastolicSeries.points.forEach((point) => {
    const currentPoint = pointMap.get(point.date);

    pointMap.set(point.date, {
      date: point.date,
      systolic: currentPoint?.systolic,
      diastolic: point.value,
    });
  });

  return {
    patientId,
    points: Array.from(pointMap.values()),
  };
}

export async function getTrendAnalysis(
  patientId: string,
  metric: TrendPageMetricKey,
  range: TrendRangeQuery = {},
): Promise<TrendAnalysis> {
  const response = await apiClient.get<TrendAnalysisResponse>(
    `/api/patients/${patientId}/metrics/trend-analysis`,
    { metricType: metric, startAt: range.startAt, endAt: range.endAt },
  );
  const riskLevel = response.riskLevel === "stable" || response.riskLevel === "high"
    ? response.riskLevel
    : "attention";

  return {
    patientId,
    metric,
    summary: response.summary || "趋势分析暂不可用，请稍后重试。",
    riskLevel,
    highlights: response.highlights ?? [],
    suggestions: response.suggestions ?? [],
    riskNote: response.riskNote || "AI 分析仅供护理参考，不构成医疗诊断或治疗建议。",
    generatedBy: response.generatedBy || "fallback",
  };
}
