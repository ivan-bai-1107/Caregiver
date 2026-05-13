import { useEffect, useMemo, useState } from "react";
import type { CareWorkbench, CareWorkbenchTab } from "@/features/care/model";
import { completeCareWorkbenchTask, getCareWorkbench } from "@/features/care/services/care.service";

const emptyWorkbench: CareWorkbench = {
  summary: {
    patientCount: 0,
    recordCount: 0,
    pendingTaskCount: 0,
    overdueTaskCount: 0,
  },
  patients: [],
  recentRecords: [],
  upcomingTasks: [],
};

export function useCareWorkbenchState() {
  const [workbench, setWorkbench] = useState<CareWorkbench>(emptyWorkbench);
  const [activeTab, setActiveTab] = useState<CareWorkbenchTab>("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWorkbench(showSuccess = false) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCareWorkbench();
      setWorkbench(response);
      return showSuccess;
    } catch {
      setError("照护工作台数据加载失败，请稍后重试。");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkbench();
  }, []);

  async function completeTask(taskId: string) {
    setIsMutating(true);
    try {
      await completeCareWorkbenchTask(taskId);
      await loadWorkbench();
      return true;
    } catch {
      return false;
    } finally {
      setIsMutating(false);
    }
  }

  const filteredPatients = useMemo(() => {
    const value = searchQuery.trim();
    if (!value) {
      return workbench.patients;
    }
    return workbench.patients.filter(
      (patient) => patient.name.includes(value) || patient.profileNote.includes(value),
    );
  }, [searchQuery, workbench.patients]);

  const filteredRecords = useMemo(() => {
    const value = searchQuery.trim();
    if (!value) {
      return workbench.recentRecords;
    }
    return workbench.recentRecords.filter(
      (record) =>
        record.patientName.includes(value) ||
        record.notes.includes(value) ||
        record.valueText.includes(value),
    );
  }, [searchQuery, workbench.recentRecords]);

  const filteredTasks = useMemo(() => {
    const value = searchQuery.trim();
    if (!value) {
      return workbench.upcomingTasks;
    }
    return workbench.upcomingTasks.filter(
      (task) => task.patientName.includes(value) || task.title.includes(value) || task.description.includes(value),
    );
  }, [searchQuery, workbench.upcomingTasks]);

  return {
    workbench,
    activeTab,
    searchQuery,
    isLoading,
    isMutating,
    error,
    filteredPatients,
    filteredRecords,
    filteredTasks,
    setActiveTab,
    setSearchQuery,
    loadWorkbench,
    completeTask,
  };
}
