import { useNavigate } from "react-router";
import {
  Plus,
  Activity,
  Thermometer,
  Droplet,
  Pill,
  Heart,
  Sparkles,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useRecordListState } from "@/features/records/state/useRecordListState";
import { appRoutes } from "@/shared/constants/routes";

export function RecordListPage() {
  const navigate = useNavigate();
  const {
    items,
    totalCount,
    filterType,
    filterPatient,
    setFilterType,
    setFilterPatient,
    patientOptions,
    isLoading,
    error,
    retry,
  } = useRecordListState();

  const filterTabs = [
    { value: "all", label: "全部" },
    { value: "blood_pressure", label: "血压" },
    { value: "temperature", label: "体温" },
    { value: "blood_sugar", label: "血糖" },
    { value: "medication", label: "用药" },
    { value: "heart_rate", label: "心率" },
  ];

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return <Activity className="w-5 h-5" />;
      case "temperature":
        return <Thermometer className="w-5 h-5" />;
      case "blood_sugar":
        return <Droplet className="w-5 h-5" />;
      case "medication":
        return <Pill className="w-5 h-5" />;
      case "heart_rate":
        return <Heart className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return "bg-primary/10 text-primary";
      case "temperature":
        return "bg-accent/10 text-accent";
      case "blood_sugar":
        return "bg-chart-2/10 text-chart-2";
      case "medication":
        return "bg-[#6C9BD1]/10 text-[#6C9BD1]";
      case "heart_rate":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            护理记录
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/ai-assistant")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/15 rounded-xl backdrop-blur-sm text-sm"
            >
              <Sparkles className="w-4 h-4" />
              AI记录
            </button>
            <button
              onClick={() =>
                navigate(
                  filterPatient === "all"
                    ? appRoutes.newRecord
                    : appRoutes.newRecordForPatient(filterPatient),
                )
              }
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              新增
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5">
          <Filter className="w-4 h-4 text-white/60 flex-shrink-0" />
          <select
            value={filterPatient}
            onChange={(event) => setFilterPatient(event.target.value)}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none appearance-none"
          >
            <option value="all" className="text-foreground bg-background">
              全部患者
            </option>
            {patientOptions.map((patient) => (
              <option key={patient.value} value={patient.value} className="text-foreground bg-background">
                {patient.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white/60 flex-shrink-0" />
        </div>
      </div>

      <div className="mobile-fixed-page-body">
      <div className="px-6 py-3 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value as typeof filterType)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors ${
                filterType === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">共 {totalCount} 条记录</p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            护理记录加载中...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">记录列表加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {!isLoading && !error
          ? items.map((record) => (
              <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getRecordColor(record.recordType)}`}
                  >
                    {getRecordIcon(record.recordType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-medium text-sm">{record.title}</h3>
                        <p className="text-xs text-muted-foreground">患者：{record.patientName}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {record.timeLabel}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-2 mb-3">{record.description}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          record.isAiGenerated
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {record.sourceLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          record.statusLabel === "已确认"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {record.statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Activity className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">暂无符合条件的记录</p>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
