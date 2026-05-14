import { useNavigate } from "react-router";
import { Search, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { usePatientListState } from "@/features/patients/state/usePatientListState";

export function PatientListPage() {
  const navigate = useNavigate();
  const { items, totalCount, searchQuery, setSearchQuery, isLoading, error, retry } =
    usePatientListState();

  const statusConfig = { color: "bg-primary/10 text-primary", label: "已接入" };

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-display)" }}>
          我的患者
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
            placeholder="搜索患者姓名"
          />
        </div>
      </div>

      <div className="mobile-fixed-page-body px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">共 {totalCount} 位患者</p>
          <button
            onClick={() => navigate("/patients/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">添加</span>
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            患者列表加载中...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">患者列表加载失败</p>
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
          ? items.map((patient) => (
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
                      <span className={`px-3 py-1 rounded-lg text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>{patient.overviewLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>档案已接入详情页</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            当前没有可展示的患者
          </div>
        ) : null}
      </div>
    </div>
  );
}
