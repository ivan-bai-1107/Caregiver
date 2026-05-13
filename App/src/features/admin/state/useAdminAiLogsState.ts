import { useEffect, useState } from "react";
import type { AdminAiLog } from "@/features/admin/model";
import { listAdminAiLogs } from "@/features/admin/services/admin.service";

export function useAdminAiLogsState() {
  const [logs, setLogs] = useState<AdminAiLog[]>([]);
  const [intent, setIntent] = useState("");
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AdminAiLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAdminAiLogs({ intent: intent || undefined, page: 1, pageSize: 50 });
      setLogs(response.items ?? []);
      setTotal(Number(response.total ?? 0));
    } catch {
      setError("AI 日志加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [intent]);

  return {
    logs,
    intent,
    total,
    selectedLog,
    isLoading,
    error,
    setIntent,
    setSelectedLog,
    retry: loadLogs,
  };
}
