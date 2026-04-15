export type TrendMetric =
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "bloodSugar"
  | "temperature"
  | "heartRate";

export interface TrendPoint {
  patientId: string;
  metric: TrendMetric;
  recordedOn: string;
  value: number;
  unit: string;
}

export interface TrendSeries {
  patientId: string;
  metric: TrendMetric;
  unit: string;
  points: TrendPoint[];
}
