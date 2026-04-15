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
import { useState } from "react";

export function RecordListPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  const [filterPatient, setFilterPatient] = useState("all");

  const records = [
    {
      id: 1,
      patient: "张明",
      type: "blood_pressure",
      title: "血压测量",
      desc: "收缩压 130 / 舒张压 85",
      time: "今天 09:15",
      source: "AI",
      confirmed: true,
    },
    {
      id: 2,
      patient: "李华",
      type: "medication",
      title: "用药记录",
      desc: "降糖药 1片，餐后服用",
      time: "今天 08:00",
      source: "手动",
      confirmed: true,
    },
    {
      id: 3,
      patient: "王芳",
      type: "temperature",
      title: "体温测量",
      desc: "36.5°C，体征正常",
      time: "今天 07:30",
      source: "手动",
      confirmed: true,
    },
    {
      id: 4,
      patient: "张明",
      type: "blood_sugar",
      title: "血糖测量",
      desc: "6.2 mmol/L",
      time: "昨天 07:00",
      source: "AI",
      confirmed: false,
    },
    {
      id: 5,
      patient: "李华",
      type: "heart_rate",
      title: "心率监测",
      desc: "72 bpm，节律规则",
      time: "昨天 20:00",
      source: "手动",
      confirmed: true,
    },
    {
      id: 6,
      patient: "王芳",
      type: "blood_pressure",
      title: "血压测量",
      desc: "收缩压 118 / 舒张压 76",
      time: "2天前 09:00",
      source: "手动",
      confirmed: true,
    },
  ];

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
      case "blood_pressure": return <Activity className="w-5 h-5" />;
      case "temperature": return <Thermometer className="w-5 h-5" />;
      case "blood_sugar": return <Droplet className="w-5 h-5" />;
      case "medication": return <Pill className="w-5 h-5" />;
      case "heart_rate": return <Heart className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case "blood_pressure": return "bg-primary/10 text-primary";
      case "temperature": return "bg-accent/10 text-accent";
      case "blood_sugar": return "bg-chart-2/10 text-chart-2";
      case "medication": return "bg-[#6C9BD1]/10 text-[#6C9BD1]";
      case "heart_rate": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filtered = records.filter(
    (r) =>
      (filterType === "all" || r.type === filterType) &&
      (filterPatient === "all" || r.patient === filterPatient)
  );

  const patients = Array.from(new Set(records.map((r) => r.patient)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
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
              onClick={() => navigate("/records/new")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              新增
            </button>
          </div>
        </div>

        {/* Patient Filter */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5">
          <Filter className="w-4 h-4 text-white/60 flex-shrink-0" />
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm focus:outline-none appearance-none"
          >
            <option value="all" className="text-foreground bg-background">全部患者</option>
            {patients.map((p) => (
              <option key={p} value={p} className="text-foreground bg-background">
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white/60 flex-shrink-0" />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="px-6 py-3 border-b border-border bg-card overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
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

      {/* Record List */}
      <div className="px-6 py-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">共 {filtered.length} 条记录</p>
        </div>

        {filtered.map((record) => (
          <div key={record.id} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getRecordColor(record.type)}`}
              >
                {getRecordIcon(record.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-medium text-sm">{record.title}</h3>
                    <p className="text-xs text-muted-foreground">患者：{record.patient}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {record.time}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-2 mb-3">{record.desc}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      record.source === "AI"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {record.source === "AI" ? "AI 生成" : "手动录入"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      record.confirmed
                        ? "bg-chart-2/10 text-chart-2"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {record.confirmed ? "已确认" : "待确认"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Activity className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">暂无符合条件的记录</p>
          </div>
        )}
      </div>
    </div>
  );
}