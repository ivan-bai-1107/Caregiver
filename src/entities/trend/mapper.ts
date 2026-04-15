import { formatMonthDayLabel } from "../../shared/lib/date";
import type { TrendMetric, TrendPoint, TrendSeries } from "./model";

export interface BloodPressureTrendPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
}

export function getTrendSeriesForPatient(
  points: TrendPoint[],
  patientId: string,
  metric: TrendMetric
): TrendSeries {
  const filteredPoints = points.filter(
    (point) => point.patientId === patientId && point.metric === metric
  );

  return {
    patientId,
    metric,
    unit: filteredPoints[0]?.unit ?? "",
    points: filteredPoints,
  };
}

export function combineBloodPressureTrend(
  points: TrendPoint[],
  patientId: string
): BloodPressureTrendPoint[] {
  const systolicSeries = getTrendSeriesForPatient(points, patientId, "bloodPressureSystolic");
  const diastolicSeries = getTrendSeriesForPatient(points, patientId, "bloodPressureDiastolic");
  const dateMap = new Map<string, BloodPressureTrendPoint>();

  systolicSeries.points.forEach((point) => {
    dateMap.set(point.recordedOn, {
      date: formatMonthDayLabel(point.recordedOn),
      systolic: point.value,
    });
  });

  diastolicSeries.points.forEach((point) => {
    const existingPoint = dateMap.get(point.recordedOn);

    dateMap.set(point.recordedOn, {
      date: formatMonthDayLabel(point.recordedOn),
      systolic: existingPoint?.systolic,
      diastolic: point.value,
    });
  });

  return Array.from(dateMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, point]) => point);
}

export function getAverageTrendValue(points: Array<number | undefined>) {
  const validPoints = points.filter((point): point is number => typeof point === "number");

  if (validPoints.length === 0) {
    return 0;
  }

  const total = validPoints.reduce((sum, value) => sum + value, 0);
  return Number((total / validPoints.length).toFixed(1));
}
