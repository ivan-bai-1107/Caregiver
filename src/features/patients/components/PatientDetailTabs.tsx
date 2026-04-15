import {
  Activity,
  CheckSquare,
  ClipboardList,
  TrendingUp,
  User,
} from "lucide-react";
import type { PatientDetailTab } from "@/features/patients/model";

const tabs: Array<{
  key: PatientDetailTab;
  label: string;
  icon: typeof Activity;
}> = [
  { key: "info", label: "基本信息", icon: User },
  { key: "records", label: "护理记录", icon: ClipboardList },
  { key: "tasks", label: "护理任务", icon: CheckSquare },
  { key: "trend", label: "健康趋势", icon: TrendingUp },
];

interface PatientDetailTabsProps {
  activeTab: PatientDetailTab;
  onChange: (tab: PatientDetailTab) => void;
}

export function PatientDetailTabs({ activeTab, onChange }: PatientDetailTabsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card px-4">
      <div className="flex items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              className={`flex flex-1 flex-col items-center gap-1 border-b-2 py-3 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
              onClick={() => onChange(tab.key)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
