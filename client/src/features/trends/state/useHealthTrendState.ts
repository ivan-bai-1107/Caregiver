import { useEffect, useMemo, useState } from "react";
import type { TrendMetric } from "@/entities/trend/model";
import { getPatient } from "@/features/patients/services/patient.service";
import {
  getBloodPressureTrendSeries,
  getMetricTrendSeries,
  getTrendAnalysis,
  type TrendAnalysis,
  type TrendRangeQuery,
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toRangeStart(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function toRangeEnd(value: string) {
  return new Date(`${value}T23:59:59`).toISOString();
}

function getRelativeRange(days: number): TrendRangeQuery {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export function useHealthTrendState(patientId?: string) {
  const [patientName, setPatientName] = useState("患者");
  const [patientMeta, setPatientMeta] = useState("");
  const [metric, setMetric] = useState<TrendPageMetric>("blood_pressure");
  const [timeRange, setTimeRange] = useState<TrendTimeRange>("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [bloodPressurePoints, setBloodPressurePoints] = useState<
    Array<{ date: string; systolic?: number; diastolic?: number }>
  >([]);
  const [singleMetricPoints, setSingleMetricPoints] = useState<Array<{ date: string; value: number }>>([]);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
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
      const isCustomRangeReady = timeRange !== "custom" || Boolean(customStartDate && customEndDate);

      if (!isCustomRangeReady) {
        setBloodPressurePoints([]);
        setSingleMetricPoints([]);
        setAnalysis(null);
        setIsAnalysisLoading(false);
        setAnalysisError(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      const range =
        timeRange === "week"
          ? getRelativeRange(7)
          : timeRange === "month"
            ? getRelativeRange(30)
            : {
                startAt: toRangeStart(customStartDate),
                endAt: toRangeEnd(customEndDate),
              };

      setIsLoading(true);
      setIsAnalysisLoading(true);
      setError(null);
      setAnalysisError(null);

      try {
        const analysisPromise = getTrendAnalysis(patientId, metric, range);
        if (metric === "blood_pressure") {
          const response = await getBloodPressureTrendSeries(patientId, range);
          if (isMounted) {
            setBloodPressurePoints(response.points);
            setSingleMetricPoints([]);
          }
        } else {
          const response = await getMetricTrendSeries(patientId, toTrendMetric(metric), range);
          if (isMounted) {
            setSingleMetricPoints(response.points);
            setBloodPressurePoints([]);
          }
        }
        try {
          const analysisResponse = await analysisPromise;
          if (isMounted) {
            setAnalysis(analysisResponse);
          }
        } catch {
          if (isMounted) {
            setAnalysis(null);
            setAnalysisError("AI 趋势分析暂时不可用，请稍后重试。");
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError("趋势数据加载失败，请稍后重试。");
          setBloodPressurePoints([]);
          setSingleMetricPoints([]);
          setAnalysis(null);
          setAnalysisError("AI 趋势分析暂时不可用，请稍后重试。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsAnalysisLoading(false);
        }
      }
    }

    void loadTrend();

    return () => {
      isMounted = false;
    };
  }, [customEndDate, customStartDate, metric, patientId, timeRange]);

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
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    suggestedCustomEndDate: toDateInputValue(new Date()),
    bloodPressurePoints,
    singleMetricPoints,
    unit: getMetricUnit(metric),
    trendStats,
    analysis,
    isAnalysisLoading,
    analysisError,
    isLoading,
    error,
  };
}
