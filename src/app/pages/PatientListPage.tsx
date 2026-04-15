import { useNavigate } from "react-router";
import { Search, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";

export function PatientListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const patients = [
    { id: 1, name: "张明", age: 68, gender: "男", condition: "高血压", status: "stable", lastRecord: "2小时前" },
    { id: 2, name: "李华", age: 72, gender: "女", condition: "糖尿病", status: "attention", lastRecord: "5小时前" },
    { id: 3, name: "王芳", age: 65, gender: "女", condition: "康复期", status: "improving", lastRecord: "1天前" },
    { id: 4, name: "赵强", age: 70, gender: "男", condition: "心脏病", status: "stable", lastRecord: "3小时前" },
  ];

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "stable":
        return { color: "bg-primary/10 text-primary", label: "稳定" };
      case "improving":
        return { color: "bg-chart-1/10 text-chart-1", label: "好转" };
      case "attention":
        return { color: "bg-accent/10 text-accent", label: "关注" };
      default:
        return { color: "bg-muted text-muted-foreground", label: "未知" };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          我的患者
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索患者姓名"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共 {filteredPatients.length} 位患者
          </p>
          <button
            onClick={() => navigate("/patients/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">添加</span>
          </button>
        </div>

        {filteredPatients.map((patient) => {
          const statusConfig = getStatusConfig(patient.status);
          return (
            <button
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="w-full bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl flex-shrink-0">
                  {patient.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-lg mb-1">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.age}岁 · {patient.gender}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>{patient.condition}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>最近记录: {patient.lastRecord}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}