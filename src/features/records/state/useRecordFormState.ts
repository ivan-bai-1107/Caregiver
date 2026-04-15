import { useEffect, useMemo, useState } from "react";
import {
  buildRecordDraftPreview,
  recordTypeOptions,
} from "../../../entities/care-record/mapper";
import {
  createEmptyRecordDraft,
  emptyCareMetricDraft,
  validateRecordDraft,
  type CareMetricDraft,
  type CareRecordDraft,
} from "../../../entities/care-record/model";
import type { RecordFormState } from "../model";
import { getRecordMetricFields } from "./recordFormConfig";
import {
  getRecordFormBootstrap,
  submitRecordDraft,
} from "../services/record.service";

export function useRecordFormState() {
  const [availablePatients, setAvailablePatients] = useState<RecordFormState["availablePatients"]>([]);
  const [draft, setDraft] = useState<CareRecordDraft>(() => createEmptyRecordDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  async function loadBootstrap() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const bootstrap = await getRecordFormBootstrap();
      setAvailablePatients(bootstrap.availablePatients);
    } catch (error) {
      setLoadError("记录表单初始化失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadBootstrap();
  }, []);

  const metricFields = useMemo(
    () => getRecordMetricFields(draft.recordType),
    [draft.recordType]
  );

  const preview = useMemo(
    () => buildRecordDraftPreview(draft.recordType, draft.metrics),
    [draft.metrics, draft.recordType]
  );

  const validation = useMemo(() => validateRecordDraft(draft), [draft]);

  const formState: RecordFormState = {
    draft,
    availablePatients,
    recordTypes: recordTypeOptions,
    metricFields,
    preview,
    validation,
    isLoading,
    loadError,
    isSubmitting,
  };

  const updateDraft = <Key extends keyof CareRecordDraft>(key: Key, value: CareRecordDraft[Key]) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      [key]: value,
    }));
  };

  const selectRecordType = (recordType: CareRecordDraft["recordType"]) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      recordType,
      metrics: { ...emptyCareMetricDraft },
    }));
  };

  const updateMetric = <Key extends keyof CareMetricDraft>(
    key: Key,
    value: CareMetricDraft[Key]
  ) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      metrics: {
        ...previousDraft.metrics,
        [key]: value,
      },
    }));
  };

  const getFieldError = (path: keyof CareRecordDraft | `metrics.${keyof CareMetricDraft}`) => {
    return validation.fieldErrors[path];
  };

  const submit = async () => {
    setHasTriedSubmit(true);

    const nextValidation = validateRecordDraft(draft);

    if (!nextValidation.isValid) {
      return {
        ok: false as const,
        validation: nextValidation,
      };
    }

    setIsSubmitting(true);

    try {
      const payload = await submitRecordDraft(draft);

      return {
        ok: true as const,
        payload,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    hasTriedSubmit,
    updateDraft,
    updateMetric,
    selectRecordType,
    getFieldError,
    submit,
    retryBootstrap: loadBootstrap,
  };
}
