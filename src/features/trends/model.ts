import type { BloodPressureTrendPoint } from "@/entities/trend/model";

export interface TrendSeriesView {
  patientId: string;
  points: BloodPressureTrendPoint[];
}
