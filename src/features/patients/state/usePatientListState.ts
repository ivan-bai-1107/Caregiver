import { useEffect, useMemo, useState } from "react";
import {
  listPatients,
  toPatientListItemView,
  type PatientListItemView,
} from "@/features/patients/services/patient.service";

export function usePatientListState() {
  const [items, setItems] = useState<PatientListItemView[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPatients() {
    setIsLoading(true);
    setError(null);

    try {
      const patients = await listPatients();
      setItems(patients.map(toPatientListItemView));
    } catch (loadError) {
      setError("患者列表加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPatients();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((patient) => patient.name.toLowerCase().includes(normalizedQuery));
  }, [items, searchQuery]);

  return {
    items: filteredItems,
    totalCount: items.length,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    retry: loadPatients,
  };
}
