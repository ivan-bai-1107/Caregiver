import { toCareMetrics, recordTypeOptions } from "../../../entities/care-record/mapper";
import type { CareRecordDraft } from "../../../entities/care-record/model";
import { toPatientOption } from "../../../entities/patient/mapper";
import { mockPatients } from "../../../entities/patient/mock";

export function getRecordFormBootstrap() {
  return {
    availablePatients: mockPatients.map(toPatientOption),
    recordTypes: recordTypeOptions,
  };
}

export async function submitRecordDraft(draft: CareRecordDraft) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    patientId: draft.patientId,
    recordType: draft.recordType,
    occurredAt: draft.occurredAt,
    notes: draft.notes,
    metrics: toCareMetrics(draft),
  };
}
