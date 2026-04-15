import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Calendar,
  Sparkles,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DataType = "blood_pressure" | "blood_sugar" | "temperature" | "heart_rate";
type TimeRange = "week" | "month" | "custom";

export function HealthTrendPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [dataType, setDataType] = useState<DataType>("blood_pressure");

  const bloodPressureData = [
    { date: "04-08", systolic: 135, diastolic: 88 },
    { date: "04-09", systolic: 132, diastolic: 85 },
    { date: "04-10", systolic: 130, diastolic: 85 },
    { date: "04-11", systolic: 128, diastolic: 82 },
    { date: "04-12", systolic: 130, diastolic: 84 },
    { date: "04-13", systolic: 125, diastolic: 80 },
    { date: "04-14", systolic: 127, diastolic: 82 },
  ];

  const bloodSugarData = [
    { date: "04-08", value: 6.8 },
    { date: "04-09", value: 6.5 },
    { date: "04-10", value: 6.2 },
    { date: "04-11", value: 6.4 },
    { date: "04-12", value: 6.1 },
    { date: "04-13", value: 5.9 },
    { date: "04-14", value: 6.0 },
  ];

  const temperatureData = [
    { date: "04-08", value: 36.7 },
    { date: "04-09", value: 36.5 },
    { date: "04-10", value: 36.8 },
    { date: "04-11", value: 36.6 },
    { date: "04-12", value: 36.5 },
    { date: "04-13", value: 36.4 },
    { date: "04-14", value: 36.5 },
  ];

  const heartRateData = [
    { date: "04-08", value: 78 },
    { date: "04-09", value: 75 },
    { date: "04-10", value: 72 },
    { date: "04-11", value: 74 },
    { date: "04-12", value: 71 },
    { date: "04-13", value: 73 },
    { date: "04-14", value: 72 },
  ];

  const getCurrentData = () => {
    switch (dataType) {
      case "blood_pressure": return bloodPressureData;
      case "blood_sugar": return bloodSugarData;
      case "temperature": return temperatureData;
      case "heart_rate": return heartRateData;
    }
  };

  const getChartConfig = () => {
    switch (dataType) {
      case "blood_pressure":
        return {
          title: "血压趋势",
          unit: "mmHg",
          avg: "129/84",
          change: "-5.2%",
          changeLabel: "较上周下降",
          trend: "down",
        };
      case "blood_sugar":
        return {
          title: "血糖趋势",
          unit: "mmol/L",
          avg: "6.27",
          change: "-8.8%",
          changeLabel: "较上周下降",
          trend: "down",
        };
      case "temperature":
        return {
          title: "体温趋势",
          unit: "°C",
          avg: "36.57",
          change: "稳定",
          changeLabel: "波动 ±0.2°C",
          trend: "stable",
        };
      case "heart_rate":
        return {
          title: "心率趋势",
          unit: "bpm",
          avg: "73.6",
          change: "-3.2%",
          changeLabel: "较上周下降",
          trend: "down",
        };
    }
  };

  const aiAnalysis = {
    blood_pressure: {
      summary: "血压整体呈下降趋势，近7天收缩压从135 mmHg降至127 mmHg，控制效果较好。",
      fluctuation: "血压波动幅度在正常范围内（最大波动±5 mmHg），节律平稳，无突发性升高或降低。",
      alert: null,
      suggestion: "建议继续保持当前用药方案和低盐饮食。每日监测时间宜固定，推荐早晨起床后静坐5分钟再测量。",
    },
    blood_sugar: {
      summary: "近7天血糖整体呈下降趋势，从6.8 mmol/L降至6.0 mmol/L，控制在目标范围内。",
      fluctuation: "血糖波动较小，空腹血糖稳定在 5.9–6.8 mmol/L 之间，未见大幅异常波动。",
      alert: null,
      suggestion: "继续规律饮食和用药。注意餐后2小时血糖监测，减少高糖高碳水食物摄入。",
    },
    temperature: {
      summary: "近7天体温保持正常范围（36.4–36.8°C），无发热或低体温情况出现。",
      fluctuation: "体温波动幅度极小（±0.2°C），属于正常生理性波动，下午略高于清晨属正常。",
      alert: null,
      suggestion: "体温监测频率可维持每日一次，如出现>37.3°C 需立即告知医护人员。",
    },
    heart_rate: {
      summary: "心率整体平稳，近7天均值73.6 bpm，在正常静息心率范围（60–100 bpm）内。",
      fluctuation: "心率波动在正常范围，无心动过速或过缓迹象。监测时患者均处于安静状态。",
      alert: null,
      suggestion: "建议避免剧烈情绪波动和重体力活动，观察活动后心率恢复情况。",
    },
  };

  const currentAnalysis = aiAnalysis[dataType];
  const chartConfig = getChartConfig();

  const metricTabs: { key: DataType; label: string }[] = [
    { key: "blood_pressure", label: "血压" },
    { key: "blood_sugar", label: "血糖" },
    { key: "temperature", label: "体温" },
    { key: "heart_rate", label: "心率" },
  ];

  const timeRangeTabs: { key: TimeRange; label: string }[] = [
    { key: "week", label: "近7天" },
    { key: "month", label: "近30天" },
    { key: "custom", label: "自定义" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(`/patients/${patientId}`)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            健康趋势分析
          </h1>
          <div className="w-10" />
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-white/70 text-xs mb-0.5">当前患者</p>
          <p className="text-lg">张明 · 68岁 · 男</p>
          <p className="text-white/60 text-xs mt-0.5">高血压、冠心病</p>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          {metricTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDataType(tab.key)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                dataType === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Time Range + Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl p-1">
            {timeRangeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeRange(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  timeRange === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">04-08 ~ 04-14</span>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{chartConfig.title}</h2>
            <span className="text-xs text-muted-foreground">{chartConfig.unit}</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCurrentData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DD" />
                <XAxis dataKey="date" stroke="#636E72" style={{ fontSize: "11px" }} />
                <YAxis stroke="#636E72" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DDD8CE",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                {dataType === "blood_pressure" && (
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                )}
                {dataType === "blood_pressure" && (
                  <Line
                    key="systolic"
                    type="monotone"
                    dataKey="systolic"
                    stroke="#5B8A72"
                    strokeWidth={2.5}
                    dot={{ fill: "#5B8A72", r: 3.5 }}
                    name="收缩压"
                  />
                )}
                {dataType === "blood_pressure" && (
                  <Line
                    key="diastolic"
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#6C9BD1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6C9BD1", r: 3.5 }}
                    name="舒张压"
                  />
                )}
                {dataType !== "blood_pressure" && (
                  <Line
                    key="value"
                    type="monotone"
                    dataKey="value"
                    stroke="#5B8A72"
                    strokeWidth={2.5}
                    dot={{ fill: "#5B8A72", r: 3.5 }}
                    name={chartConfig.title}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">周期均值</span>
            </div>
            <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
              {chartConfig.avg}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{chartConfig.unit}</p>
          </div>
          <div className="bg-chart-2/5 rounded-2xl p-4 border border-chart-2/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">变化趋势</span>
            </div>
            <p className="text-2xl text-chart-2" style={{ fontFamily: "var(--font-display)" }}>
              {chartConfig.change}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{chartConfig.changeLabel}</p>
          </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl border border-primary/15 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">AI 健康分析</h3>
                <p className="text-xs text-muted-foreground">基于近7天数据 · 仅供参考，请遵医嘱</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* 趋势概述 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">趋势概述</p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {currentAnalysis.summary}
              </p>
            </div>
            {/* 波动说明 */}
            <div className="pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">波动说明</p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {currentAnalysis.fluctuation}
              </p>
            </div>
            {/* 异常提示 */}
            <div className="pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">异常提示</p>
              {currentAnalysis.alert ? (
                <div className="flex items-start gap-2 bg-accent/10 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/85">{currentAnalysis.alert}</p>
                </div>
              ) : (
                <p className="text-sm text-primary/80">
                  ✓ 本周期内未检测到明显异常波动
                </p>
              )}
            </div>
            {/* 护理建议 */}
            <div className="pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">护理建议</p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {currentAnalysis.suggestion}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠ 以上为非诊断性护理参考建议，具体治疗方案请遵主治医生指导
              </p>
            </div>
          </div>
        </div>

        {/* View Raw Records */}
        <button
          onClick={() => navigate("/records")}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-card border border-border rounded-2xl text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          查看原始记录数据
        </button>
      </div>
    </div>
  );
}