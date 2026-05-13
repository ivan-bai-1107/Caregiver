import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, ClipboardList } from "lucide-react";
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
    bloodPressurePoints,
    singleMetricPoints,
    unit,
    trendStats,
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

  return (
    <div className="min-h-screen bg-background">
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
          <p className="text-lg">{patientName}</p>
          <p className="text-white/60 text-xs mt-0.5">{patientMeta}</p>
        </div>
      </div>

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
            <span className="text-xs">
              {timeRange === "week" ? "近7天" : timeRange === "month" ? "近30天" : "自定义"}
            </span>
          </div>
        </div>

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
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">趋势接入说明</h3>
                <p className="text-xs text-muted-foreground">本轮只接 series 数据，不进入 AI 深分析</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">当前状态</p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                当前页面已改为真实后端 API 驱动。血压继续按双请求组合，其他指标维持单指标单请求。
              </p>
            </div>
            <div className="pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">本轮边界</p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                趋势分析、异常解释和护理建议仍留到下一批处理，这里只负责把结构化 series 拉通并展示出来。
              </p>
            </div>
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
  );
}
