import { combineBloodPressureTrend } from "@/entities/trend/mapper";
import { trendPointMocks } from "@/entities/trend/mock";

export async function getBloodPressureTrendSeries(patientId: string) {
  const points = trendPointMocks.filter(
    (point) =>
      point.patientId === patientId &&
      (point.metricType === "bloodPressureSystolic" || point.metricType === "bloodPressureDiastolic"),
  );

  return Promise.resolve({
    patientId,
    points: combineBloodPressureTrend(points),
  });
}
