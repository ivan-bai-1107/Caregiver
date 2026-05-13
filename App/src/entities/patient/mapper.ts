import type { Patient } from "./model";

export interface PatientOption {
  value: string;
  label: string;
}

export function toPatientOption(patient: Patient): PatientOption {
  return {
    value: patient.id,
    label: `${patient.name}（${patient.age}岁）`,
  };
}

export function getPatientInitial(patient: Pick<Patient, "name">) {
  return patient.name.slice(0, 1);
}
