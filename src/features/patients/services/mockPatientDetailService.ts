import {
  careTaskRepeatRuleLabels,
  careTaskStatusLabels,
  getCareTaskTimeLabel,
} from "../../../entities/care-task/mapper";
import { mockCareTasks } from "../../../entities/care-task/mock";
import { getCareRecordTimeLabel, getCareRecordValueLabel, recordSourceLabels, recordTypeLabels } from "../../../entities/care-record/mapper";
import { mockCareRecords } from "../../../entities/care-record/mock";
import { mockPatients } from "../../../entities/patient/mock";
import { combineBloodPressureTrend, getAverageTrendValue } from "../../../entities/trend/mapper";
import { mockTrendPoints } from "../../../entities/trend/mock";
import type { PatientDetailView, PatientRecentRecordItem, PatientUpcomingTaskItem } from "../model";

const patientDetailMeta: Record<
  string,
  {
    conditionSummary: string;
    summaryText: string;
    insightText: string;
  }
> = {
  "1": {
    conditionSummary: "高血压、冠心病",
    summaryText: "血压整体呈平稳下降趋势，近 7 天记录完整，适合作为持续护理观察窗口。",
    insightText: "建议继续保持当前用药和晨间监测节奏，并重点关注午后活动后的血压回弹情况。",
  },
  "2": {
    conditionSummary: "糖尿病管理期",
    summaryText: "当前更适合从血糖和饮食记录联动观察，近期数据连续性正在改善。",
    insightText: "建议继续固定空腹记录时段，避免在 Patient 核心实体中继续堆积饮食类字段。",
  },
  "3": {
    conditionSummary: "康复期观察",
    summaryText: "康复记录以体温、状态观察和训练反馈为主，趋势维度仍保持轻量。",
    insightText: "维持训练前后主观疲劳记录，有助于后续扩展任务与记录联动。",
  },
  "4": {
    conditionSummary: "心率稳定观察",
    summaryText: "当前趋势数据较少，适合作为 MVP 阶段的轻量观察页。",
    insightText: "后续若扩展趋势页，仍建议保持单指标单请求，不提前重写后端 contract。",
  },
};

function buildRecentRecords(patientId: string): PatientRecentRecordItem[] {
  return mockCareRecords
    .filter((record) => record.patientId === patientId)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 4)
    .map((record) => ({
      id: record.id,
      title: recordTypeLabels[record.recordType],
      valueLabel: getCareRecordValueLabel(record),
      timeLabel: getCareRecordTimeLabel(record),
      sourceLabel: recordSourceLabels[record.source],
      isAiGenerated: record.source === "ai",
      statusLabel: "已确认",
    }));
}

function buildUpcomingTasks(patientId: string): PatientUpcomingTaskItem[] {
  return mockCareTasks
    .filter(
      (task) =>
        task.patientId === patientId && (task.status === "pending" || task.status === "scheduled")
    )
    .sort((left, right) => left.remindTime.localeCompare(right.remindTime))
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      title: task.title,
      timeLabel: getCareTaskTimeLabel(task),
      status: task.status,
      repeatRuleLabel: careTaskRepeatRuleLabels[task.repeatRule],
      priority: task.priority,
    }));
}

function buildChangePercent(values: number[]) {
  if (values.length < 2 || values[0] === 0) {
    return 0;
  }

  const first = values[0];
  const last = values[values.length - 1];
  return Number((((last - first) / first) * 100).toFixed(1));
}

export function getPatientDetailView(patientId: string): PatientDetailView | null {
  const patient = mockPatients.find((item) => item.id === patientId);

  if (!patient) {
    return null;
  }

  const meta = patientDetailMeta[patientId] ?? {
    conditionSummary: "待补充",
    summaryText: "当前页面已改为 view model 聚合，但该患者的聚合摘要尚未补充。",
    insightText: "可继续沿用当前模型补齐该患者的 records/tasks/trend preview。",
  };

  const recentRecords = buildRecentRecords(patientId);
  const upcomingTasks = buildUpcomingTasks(patientId);
  const chartData = combineBloodPressureTrend(mockTrendPoints, patientId);
  const averageSystolic = getAverageTrendValue(chartData.map((item) => item.systolic));
  const averageDiastolic = getAverageTrendValue(chartData.map((item) => item.diastolic));
  const changePercent = buildChangePercent(
    chartData.map((item) => item.systolic).filter((item): item is number => typeof item === "number")
  );

  return {
    patient,
    conditionSummary: meta.conditionSummary,
    overview: {
      recordCount: mockCareRecords.filter((record) => record.patientId === patientId).length,
      pendingTaskCount: mockCareTasks.filter(
        (task) =>
          task.patientId === patientId && (task.status === "pending" || task.status === "scheduled")
      ).length,
      trendWindowDays: chartData.length,
    },
    recentRecords,
    upcomingTasks,
    trendPreview: {
      metricKey: "blood_pressure",
      chartData,
      averageSystolic,
      averageDiastolic,
      changePercent,
      summaryText: meta.summaryText,
      insightText: meta.insightText,
    },
  };
}

export { careTaskStatusLabels };
