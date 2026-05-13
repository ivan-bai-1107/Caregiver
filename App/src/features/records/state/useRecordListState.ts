import { useEffect, useMemo, useState } from "react";
import { listCareRecords, type RecordListItemView } from "@/features/records/services/record.service";

export function useRecordListState() {
  const [items, setItems] = useState<RecordListItemView[]>([]);
  const [filterType, setFilterType] = useState<RecordListItemView["recordType"] | "all">("all");
  const [filterPatient, setFilterPatient] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecords() {
    setIsLoading(true);
    setError(null);

    try {
      const nextItems = await listCareRecords();
      setItems(nextItems);
    } catch (loadError) {
      setError("护理记录加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  const patientOptions = useMemo(
    () =>
      Array.from(new Map(items.map((item) => [item.patientId, item.patientName])).entries()).map(
        ([value, label]) => ({
          value,
          label,
        }),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (filterType === "all" || item.recordType === filterType) &&
          (filterPatient === "all" || item.patientId === filterPatient),
      ),
    [filterPatient, filterType, items],
  );

  return {
    items: filteredItems,
    totalCount: filteredItems.length,
    filterType,
    filterPatient,
    setFilterType,
    setFilterPatient,
    patientOptions,
    isLoading,
    error,
    retry: loadRecords,
  };
}
