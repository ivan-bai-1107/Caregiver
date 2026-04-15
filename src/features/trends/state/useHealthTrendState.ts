import { useEffect, useMemo, useState } from "react";
import type { TrendMetric } from "@/entities/trend/model";
import { getPatient } from "@/features/patients/services/patient.service";
import {
  getBloodPressureTrendSeries,
  getMetricTrendSeries,
} from "@/features/trends/services/trend.service";

export type TrendPageMetric = "blood_pressure" | "blood_sugar" | "temperature" | "heart_rate";
export type TrendTimeRange = "week" | "month" | "custom";

function toTrendMetric(metric: TrendPageMetric): TrendMetric {
  switch (metric) {
    case "blood_sugar":
      return "bloodSugar";
    case "temperature":
      return "temperature";
    case "heart_rate":
      return "heartRate";
    default:
      return "bloodPressureSystolic";
  }
}

function getMetricUnit(metric: TrendPageMetric) {
  switch (metric) {
    case "blood_sugar":
      return "mmol/L";
    case "temperature":
      return "°C";
    case "heart_rate":
      return "bpm";
    default:
      return "mmHg";
  }
}

export function useHealthTrendState(patientId?: string) {
  const [patientName, setPatientName] = useState("患者");
  const [patientMeta, setPatientMeta] = useState("");
  const [metric, setMetric] = useState<TrendPageMetric>("blood_pressure");
  const [timeRange, setTimeRange] = useState<TrendTimeRange>("week");
  const [bloodPressurePoints, setBloodPressurePoints] = useState<
    Array<{ date: string; systolic?: number; diastolic?: number }>
  >([]);
  const [singleMetricPoints, setSingleMetricPoints] = useState<Array<{ date: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadBasePatient() {
      try {
        const patient = await getPatient(patientId);
        if (isMounted) {
          setPatientName(patient.name);
          setPatientMeta(`${patient.age}岁 · ${patient.gender}`);
        }
      } catch {
        if (isMounted) {
          setPatientName("患者");
          setPatientMeta("信息暂不可用");
        }
      }
    }

    void loadBasePatient();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadTrend() {
      setIsLoading(true);
      setError(null);

      try {
        if (metric === "blood_pressure") {
          const response = await getBloodPressureTrendSeries(patientId);
          if (isMounted) {
            setBloodPressurePoints(response.points);
            setSingleMetricPoints([]);
          }
        } else {
          const response = await getMetricTrendSeries(patientId, toTrendMetric(metric));
          if (isMounted) {
            setSingleMetricPoints(response.points);
            setBloodPressurePoints([]);
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError("趋势数据加载失败，请稍后重试。");
          setBloodPressurePoints([]);
          setSingleMetricPoints([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTrend();

    return () => {
      isMounted = false;
    };
  }, [metric, patientId, timeRange]);

  const trendStats = useMemo(() => {
    if (metric === "blood_pressure") {
      const systolicValues = bloodPressurePoints
        .map((point) => point.systolic)
        .filter((value): value is number => typeof value === "number");
      const diastolicValues = bloodPressurePoints
        .map((point) => point.diastolic)
        .filter((value): value is number => typeof value === "number");

      return {
        primaryValue: systolicValues.length
          ? (systolicValues.reduce((sum, value) => sum + value, 0) / systolicValues.length).toFixed(1)
          : "--",
        secondaryValue: diastolicValues.length
          ? (diastolicValues.reduce((sum, value) => sum + value, 0) / diastolicValues.length).toFixed(1)
          : "--",
      };
    }

    const values = singleMetricPoints.map((point) => point.value);
    const averageValue = values.length
      ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
      : "--";
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changeText =
      typeof firstValue === "number" && typeof lastValue === "number"
        ? `${(lastValue - firstValue).toFixed(1)}`
        : "--";

    return {
      primaryValue: averageValue,
      secondaryValue: changeText,
    };
  }, [bloodPressurePoints, metric, singleMetricPoints]);

  return {
    patientName,
    patientMeta,
    metric,
    setMetric,
    timeRange,
    setTimeRange,
    bloodPressurePoints,
    singleMetricPoints,
    unit: getMetricUnit(metric),
    trendStats,
    isLoading,
    error,
  };
}
