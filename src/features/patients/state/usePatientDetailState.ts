import { useMemo, useState } from "react";
import type { PatientDetailTab } from "../model";
import { getPatientDetailView } from "../services/mockPatientDetailService";

export function usePatientDetailState(patientId?: string) {
  const [activeTab, setActiveTab] = useState<PatientDetailTab>("info");

  const detailView = useMemo(() => {
    if (!patientId) {
      return null;
    }

    return getPatientDetailView(patientId);
  }, [patientId]);

  return {
    detailView,
    activeTab,
    setActiveTab,
  };
}
