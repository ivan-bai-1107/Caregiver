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
