import { useEffect, useState } from "react";
import type { AdminDashboardSummary } from "@admin/model";
import { getAdminDashboardSummary } from "@admin/services/admin.service";

export function useAdminDashboardState() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    setIsLoading(true);
    setError(null);
    try {
      setSummary(await getAdminDashboardSummary());
    } catch {
      setError("后台统计加载失败，请重新登录后再试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();
  }, []);

  return {
    summary,
    isLoading,
    error,
    retry: loadSummary,
  };
}
