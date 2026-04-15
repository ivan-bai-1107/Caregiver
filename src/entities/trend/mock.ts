import type { TrendPoint } from "./model";

export const mockTrendPoints: TrendPoint[] = [
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-08", value: 135, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-08", value: 88, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-09", value: 132, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-09", value: 85, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-10", value: 130, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-10", value: 85, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-11", value: 128, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-11", value: 82, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-12", value: 130, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-12", value: 84, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-13", value: 125, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-13", value: 80, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureSystolic", recordedOn: "2026-04-14", value: 127, unit: "mmHg" },
  { patientId: "1", metric: "bloodPressureDiastolic", recordedOn: "2026-04-14", value: 82, unit: "mmHg" },
  { patientId: "2", metric: "bloodSugar", recordedOn: "2026-04-10", value: 6.5, unit: "mmol/L" },
  { patientId: "2", metric: "bloodSugar", recordedOn: "2026-04-11", value: 6.3, unit: "mmol/L" },
  { patientId: "2", metric: "bloodSugar", recordedOn: "2026-04-12", value: 6.1, unit: "mmol/L" },
  { patientId: "3", metric: "temperature", recordedOn: "2026-04-12", value: 36.6, unit: "°C" },
  { patientId: "3", metric: "temperature", recordedOn: "2026-04-13", value: 36.5, unit: "°C" },
  { patientId: "4", metric: "heartRate", recordedOn: "2026-04-14", value: 74, unit: "bpm" },
];
