import type {
  CareMetricDraft,
  CareRecordDraft,
  RecordDraftValidationResult,
} from "../../entities/care-record/model";
import type {
  RecordDraftPreview,
  RecordTypeOption,
} from "../../entities/care-record/mapper";
import type { PatientOption } from "../../entities/patient/mapper";

export type RecordMetricFieldKey = keyof CareMetricDraft;

export interface RecordMetricFieldDefinition {
  key: RecordMetricFieldKey;
  label: string;
  kind: "number" | "text" | "textarea";
  required: boolean;
  placeholder?: string;
  unit?: string;
  helperText?: string;
  step?: string;
  rows?: number;
  columns?: 1 | 2;
}

export interface RecordFormState {
  draft: CareRecordDraft;
  availablePatients: PatientOption[];
  recordTypes: RecordTypeOption[];
  metricFields: RecordMetricFieldDefinition[];
  preview: RecordDraftPreview | null;
  validation: RecordDraftValidationResult;
  isSubmitting: boolean;
}
