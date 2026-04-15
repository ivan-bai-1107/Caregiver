import { useMemo, useState } from "react";
import {
  buildRecordDraftPreview,
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
} from "../services/mockRecordFormService";

export function useRecordFormState() {
  const [bootstrap] = useState(() => getRecordFormBootstrap());
  const [draft, setDraft] = useState<CareRecordDraft>(() => createEmptyRecordDraft());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

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
    availablePatients: bootstrap.availablePatients,
    recordTypes: bootstrap.recordTypes,
    metricFields,
    preview,
    validation,
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
  };
}
