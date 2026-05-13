export type PatientId = string;

export type PatientGender = "男" | "女" | "其他";

export interface Patient {
  id: PatientId;
  userId: string;
  name: string;
  age: number;
  gender: PatientGender;
  profileNote: string;
}
