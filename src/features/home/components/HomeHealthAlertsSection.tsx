import { AlertCircle } from "lucide-react";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import type { HomeHealthAlert } from "../model";

interface HomeHealthAlertsSectionProps {
  alerts: HomeHealthAlert[];
}

export function HomeHealthAlertsSection({ alerts }: HomeHealthAlertsSectionProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="px-6 mt-6">
      <SectionHeader title="健康异常提醒" icon={<AlertCircle className="w-4 h-4 text-accent" />} />
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${
              alert.severity === "warning"
                ? "bg-accent/5 border-accent/20"
                : "bg-chart-2/5 border-chart-2/20"
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                    alert.severity === "warning" ? "bg-accent" : "bg-chart-2"
                  }`}
                />
                <span className="font-medium text-sm">{alert.patientName}</span>
              </div>
              <span className="text-xs text-muted-foreground">{alert.timeLabel}</span>
            </div>
            <p className="text-sm text-foreground/80 ml-3.5">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
