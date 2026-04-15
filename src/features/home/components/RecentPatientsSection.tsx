import { ChevronRight, Plus } from "lucide-react";
import { SectionHeader } from "../../../shared/ui/SectionHeader";
import type { RecentPatientCard } from "../model";

interface RecentPatientsSectionProps {
  patients: RecentPatientCard[];
  onViewAll: () => void;
  onOpenPatient: (patientId: string) => void;
  onAddPatient: () => void;
}

export function RecentPatientsSection({
  patients,
  onViewAll,
  onOpenPatient,
  onAddPatient,
}: RecentPatientsSectionProps) {
  return (
    <div className="px-6 mt-8">
      <SectionHeader
        title="最近查看患者"
        action={
          <button onClick={onViewAll} className="flex items-center gap-1 text-sm text-primary">
            全部患者
            <ChevronRight className="w-4 h-4" />
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        {patients.map((patient) => (
          <button
            key={patient.patientId}
            onClick={() => onOpenPatient(patient.patientId)}
            className="bg-card rounded-2xl p-4 border border-border text-left hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {patient.name[0]}
              </div>
              <div
                className={`w-2 h-2 rounded-full ml-auto ${
                  patient.status === "attention"
                    ? "bg-accent"
                    : patient.status === "improving"
                    ? "bg-chart-2"
                    : "bg-primary"
                }`}
              />
            </div>
            <h3 className="font-medium text-sm mb-0.5">{patient.name}</h3>
            <p className="text-xs text-muted-foreground">
              {patient.age}岁 · {patient.conditionSummary}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{patient.lastActivityLabel}</p>
          </button>
        ))}
        <button
          onClick={onAddPatient}
          className="bg-primary/5 rounded-2xl p-4 border border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-7 h-7 text-primary" />
          <span className="text-xs text-primary">添加患者</span>
        </button>
      </div>
    </div>
  );
}
