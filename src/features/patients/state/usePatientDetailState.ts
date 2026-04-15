import { useEffect, useState } from "react";
import type { PatientDetailTab } from "../model";
import { getPatientDashboard } from "../services/patient.service";

export function usePatientDetailState(patientId?: string) {
  const [activeTab, setActiveTab] = useState<PatientDetailTab>("info");
  const [detailView, setDetailView] = useState<Awaited<ReturnType<typeof getPatientDashboard>> | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setDetailView(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadDetailView() {
      setIsLoading(true);
      setError(null);

      try {
        const nextDetailView = await getPatientDashboard(patientId);
        if (isMounted) {
          setDetailView(nextDetailView);
        }
      } catch (loadError) {
        if (isMounted) {
          setError("患者中心页加载失败，请稍后重试。");
          setDetailView(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetailView();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  return {
    detailView,
    activeTab,
    setActiveTab,
    isLoading,
    error,
  };
}
