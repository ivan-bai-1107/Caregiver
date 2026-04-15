export const patientDetailMetaById: Record<
  string,
  { conditionSummary: string; trendInsightText: string }
> = {
  "1": {
    conditionSummary: "高血压、冠心病",
    trendInsightText:
      "血压整体呈下降趋势，控制效果较稳定，建议继续保持当前用药与低盐饮食方案。",
  },
  "2": {
    conditionSummary: "糖尿病管理中",
    trendInsightText:
      "血糖波动仍需观察，可继续跟踪空腹与餐后记录，配合用药依从性评估。",
  },
  "3": {
    conditionSummary: "康复期观察",
    trendInsightText:
      "心率与训练反馈总体平稳，可继续按照康复计划推进日常训练安排。",
  },
  "4": {
    conditionSummary: "心血管风险观察",
    trendInsightText:
      "当前趋势数据较少，建议优先补齐基础体征记录后再做完整趋势分析。",
  },
};
