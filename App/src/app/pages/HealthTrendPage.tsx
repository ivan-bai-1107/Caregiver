import { useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, Calendar, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useHealthTrendState } from "@/features/trends/state/useHealthTrendState";

type DataType = "blood_pressure" | "blood_sugar" | "temperature" | "heart_rate";
type TimeRange = "week" | "month" | "custom";

export function HealthTrendPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const {
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
    bloodPressurePoints,
    singleMetricPoints,
    unit,
    trendStats,
    analysis,
    isAnalysisLoading,
    analysisError,
    isLoading,
    error,
  } = useHealthTrendState(patientId);

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

  const chartTitle =
    metric === "blood_pressure"
      ? "血压趋势"
      : metric === "blood_sugar"
        ? "血糖趋势"
        : metric === "temperature"
          ? "体温趋势"
          : "心率趋势";

  const hasData = metric === "blood_pressure" ? bloodPressurePoints.length > 0 : singleMetricPoints.length > 0;
  const customRangeReady = timeRange !== "custom" || Boolean(customStartDate && customEndDate);
  const rangeLabel =
    timeRange === "week"
      ? "近7天"
      : timeRange === "month"
        ? "近30天"
        : customRangeReady
          ? `${customStartDate} 至 ${customEndDate}`
          : "请选择日期";
  const riskLabel =
    analysis?.riskLevel === "high"
      ? "高关注"
      : analysis?.riskLevel === "attention"
        ? "需关注"
        : "平稳";
  const riskClass =
    analysis?.riskLevel === "high"
      ? "bg-destructive/10 text-destructive"
      : analysis?.riskLevel === "attention"
        ? "bg-accent/10 text-accent"
        : "bg-primary/10 text-primary";

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
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
          <p className="text-lg">{patientName}</p>
          <p className="text-white/60 text-xs mt-0.5">{patientMeta}</p>
        </div>
      </div>

      <div className="mobile-fixed-page-body">
      <div className="px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          {metricTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMetric(tab.key)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                metric === tab.key
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
            <span className="text-xs">{rangeLabel}</span>
          </div>
        </div>

        {timeRange === "custom" ? (
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4">
            <label className="text-xs text-muted-foreground">
              开始日期
              <input
                type="date"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-input-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              结束日期
              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(event) => setCustomEndDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-input-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </label>
            {!customRangeReady ? (
              <p className="col-span-2 text-xs text-accent">
                请选择开始和结束日期后再加载自定义趋势。
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{chartTitle}</h2>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <div className="h-56">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                趋势数据加载中...
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center text-sm text-accent">
                {error}
              </div>
            ) : !customRangeReady ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                请选择自定义日期范围
              </div>
            ) : hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric === "blood_pressure" ? bloodPressurePoints : singleMetricPoints}>
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
                  {metric === "blood_pressure" ? (
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  ) : null}
                  {metric === "blood_pressure" ? (
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#5B8A72"
                      strokeWidth={2.5}
                      dot={{ fill: "#5B8A72", r: 3.5 }}
                      name="收缩压"
                    />
                  ) : null}
                  {metric === "blood_pressure" ? (
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#6C9BD1"
                      strokeWidth={2.5}
                      dot={{ fill: "#6C9BD1", r: 3.5 }}
                      name="舒张压"
                    />
                  ) : null}
                  {metric !== "blood_pressure" ? (
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#5B8A72"
                      strokeWidth={2.5}
                      dot={{ fill: "#5B8A72", r: 3.5 }}
                      name="指标值"
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                当前暂无可展示的趋势数据
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">周期均值</span>
            </div>
            <p className="text-2xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
              {trendStats.primaryValue}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{unit}</p>
          </div>
          <div className="bg-chart-2/5 rounded-2xl p-4 border border-chart-2/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {metric === "blood_pressure" ? "平均舒张压" : "首末变化"}
              </span>
            </div>
            <p className="text-2xl text-chart-2" style={{ fontFamily: "var(--font-display)" }}>
              {trendStats.secondaryValue}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metric === "blood_pressure" ? unit : "与首个点位相比"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-2xl border border-primary/15 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">AI 趋势分析</h3>
                  {analysis ? (
                    <span className={`rounded-lg px-2 py-0.5 text-xs ${riskClass}`}>
                      {riskLabel}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis?.generatedBy === "deepseek" ? "DeepSeek 分析 · Redis 缓存" : "本地兜底分析 · Redis 缓存"}
                </p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            {isAnalysisLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在生成 AI 趋势分析...
              </div>
            ) : null}

            {!isAnalysisLoading && analysisError ? (
              <div className="flex items-start gap-2 rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <p className="text-sm text-foreground/75">{analysisError}</p>
              </div>
            ) : null}

            {!isAnalysisLoading && analysis ? (
              <div className="space-y-4">
                <p className="text-sm text-foreground/85 leading-relaxed">{analysis.summary}</p>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">关键观察</p>
                  <div className="space-y-2">
                    {analysis.highlights.map((item) => (
                      <div key={item} className="rounded-xl bg-card/70 px-3 py-2 text-sm text-foreground/80">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">护理建议</p>
                  <div className="space-y-2">
                    {analysis.suggestions.map((item) => (
                      <div key={item} className="rounded-xl bg-primary/5 px-3 py-2 text-sm text-foreground/80">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-accent/5 px-3 py-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                  <p className="text-xs text-foreground/65 leading-relaxed">{analysis.riskNote}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => navigate("/records")}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-card border border-border rounded-2xl text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          查看原始记录数据
        </button>
      </div>
      </div>
    </div>
  );
}
