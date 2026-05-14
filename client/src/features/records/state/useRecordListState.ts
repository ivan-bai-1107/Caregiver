import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { getPatientOptions } from "@/features/patients/services/patient.service";
import { listCareRecords, type RecordListItemView } from "@/features/records/services/record.service";

export function useRecordListState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientParam = searchParams.get("patient") ?? "";
  const [items, setItems] = useState<RecordListItemView[]>([]);
  const [filterType, setFilterType] = useState<RecordListItemView["recordType"] | "all">("all");
  const [filterPatient, setFilterPatientState] = useState<string>(() => patientParam || "all");
  const [patientOptions, setPatientOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecords() {
    setIsLoading(true);
    setError(null);

    try {
      const [nextItems, nextPatientOptions] = await Promise.all([
        listCareRecords({
          patientId: filterPatient === "all" ? undefined : filterPatient,
          recordType: filterType === "all" ? undefined : filterType,
          pageSize: 100,
        }),
        getPatientOptions(),
      ]);
      setItems(nextItems);
      setPatientOptions(nextPatientOptions);
    } catch (loadError) {
      setError("护理记录加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, [filterPatient, filterType]);

  useEffect(() => {
    const nextPatient = patientParam || "all";
    setFilterPatientState((currentPatient) =>
      currentPatient === nextPatient ? currentPatient : nextPatient,
    );
  }, [patientParam]);

  const setFilterPatient = (value: string) => {
    setFilterPatientState(value);
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (value === "all") {
        nextParams.delete("patient");
      } else {
        nextParams.set("patient", value);
      }
      return nextParams;
    });
  };

  return {
    items,
    totalCount: items.length,
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
