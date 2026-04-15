import { useEffect, useState } from "react";
import {
  createEmptyPatientFormDraft,
  createPatient,
  getPatient,
  updatePatient,
  validatePatientFormDraft,
  type PatientFormDraft,
} from "@/features/patients/services/patient.service";

export function usePatientFormState(patientId?: string) {
  const isEdit = Boolean(patientId);
  const [draft, setDraft] = useState<PatientFormDraft>(createEmptyPatientFormDraft());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PatientFormDraft, string>>>({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!patientId) {
      return;
    }

    let isMounted = true;

    async function loadPatient() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const patient = await getPatient(patientId);
        if (isMounted) {
          setDraft(createEmptyPatientFormDraft(patient));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("患者信息加载失败，请稍后重试。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPatient();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  function updateDraft<Key extends keyof PatientFormDraft>(key: Key, value: PatientFormDraft[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));

    if (fieldErrors[key]) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [key]: "",
      }));
    }
  }

  async function submit() {
    const validation = validatePatientFormDraft(draft);
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      return {
        ok: false as const,
        validation,
      };
    }

    setIsSubmitting(true);

    try {
      const savedPatient = patientId
        ? await updatePatient(patientId, draft)
        : await createPatient(draft);

      return {
        ok: true as const,
        patient: savedPatient,
      };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isEdit,
    draft,
    fieldErrors,
    isLoading,
    loadError,
    isSubmitting,
    updateDraft,
    submit,
  };
}
