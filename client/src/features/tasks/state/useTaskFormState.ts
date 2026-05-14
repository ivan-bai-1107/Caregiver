import { useEffect, useState } from "react";
import {
  createEmptyCareTaskDraft,
  validateCareTaskDraft,
  type CareTaskDraft,
} from "@/entities/care-task/model";
import type { TaskFormState } from "@/features/tasks/model";
import {
  createCareTask,
  getTaskFormBootstrap,
} from "@/features/tasks/services/task.service";

export function useTaskFormState(initialPatientId = "") {
  const [availablePatients, setAvailablePatients] = useState<TaskFormState["availablePatients"]>([]);
  const [draft, setDraft] = useState(createEmptyCareTaskDraft());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBootstrap() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const bootstrap = await getTaskFormBootstrap();
      setAvailablePatients(bootstrap.availablePatients);
      setDraft((previousDraft) => {
        if (previousDraft.patientId || !initialPatientId) {
          return previousDraft;
        }

        const hasInitialPatient = bootstrap.availablePatients.some(
          (patient) => patient.value === initialPatientId,
        );

        return hasInitialPatient
          ? {
              ...previousDraft,
              patientId: initialPatientId,
            }
          : previousDraft;
      });
    } catch (error) {
      setLoadError("任务表单初始化失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBootstrap();
  }, [initialPatientId]);

  function updateDraft<Key extends keyof CareTaskDraft>(
    key: Key,
    value: CareTaskDraft[Key],
  ) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      [key]: value,
    }));

    if (validationErrors[key]) {
      setValidationErrors((previousErrors) => ({
        ...previousErrors,
        [key]: "",
      }));
    }
  }

  async function submit() {
    const validation = validateCareTaskDraft(draft);
    setValidationErrors(validation.fieldErrors as Record<string, string>);
    setValidationMessages(validation.messages);

    if (!validation.isValid) {
      return {
        ok: false as const,
        validation,
      };
    }

    setIsSubmitting(true);

    try {
      const createdTask = await createCareTask(draft);
      return {
        ok: true as const,
        createdTask,
      };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    formState: {
      draft,
      availablePatients,
      validationErrors,
      validationMessages,
      isLoading,
      loadError,
      isSubmitting,
    } satisfies TaskFormState,
    updateDraft,
    retryBootstrap: loadBootstrap,
    submit,
  };
}
