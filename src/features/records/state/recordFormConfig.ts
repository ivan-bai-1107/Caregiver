import type { CareRecordDraft } from "../../../entities/care-record/model";
import type { RecordMetricFieldDefinition } from "../model";

export function getRecordMetricFields(
  recordType: CareRecordDraft["recordType"]
): RecordMetricFieldDefinition[] {
  switch (recordType) {
    case "blood_pressure":
      return [
        {
          key: "bloodPressureSystolic",
          label: "收缩压",
          kind: "number",
          required: true,
          placeholder: "如：130",
          unit: "mmHg",
          helperText: "建议在安静状态下测量。",
          columns: 2,
        },
        {
          key: "bloodPressureDiastolic",
          label: "舒张压",
          kind: "number",
          required: true,
          placeholder: "如：85",
          unit: "mmHg",
          helperText: "保持与收缩压同一次测量。",
          columns: 2,
        },
      ];
    case "temperature":
      return [
        {
          key: "temperature",
          label: "体温",
          kind: "number",
          required: true,
          placeholder: "如：36.5",
          unit: "°C",
          helperText: "正常范围：36.0 – 37.2°C",
          step: "0.1",
        },
      ];
    case "blood_sugar":
      return [
        {
          key: "bloodSugar",
          label: "血糖值",
          kind: "number",
          required: true,
          placeholder: "如：6.2",
          unit: "mmol/L",
          helperText: "空腹正常范围：3.9 – 6.1 mmol/L",
          step: "0.1",
        },
      ];
    case "heart_rate":
      return [
        {
          key: "heartRate",
          label: "心率",
          kind: "number",
          required: true,
          placeholder: "如：72",
          unit: "bpm",
          helperText: "正常静息心率：60 – 100 bpm",
        },
      ];
    case "medication":
      return [
        {
          key: "medicationName",
          label: "药品名称",
          kind: "text",
          required: true,
          placeholder: "如：硝苯地平缓释片",
        },
        {
          key: "medicationDose",
          label: "用药剂量",
          kind: "text",
          required: false,
          placeholder: "如：1片 / 5mg",
        },
      ];
    case "diet":
      return [
        {
          key: "dietDescription",
          label: "饮食内容",
          kind: "textarea",
          required: true,
          placeholder: "描述本次饮食内容，包括食物种类、大致分量等...",
          rows: 3,
        },
      ];
    case "other":
      return [
        {
          key: "observationText",
          label: "状态描述",
          kind: "textarea",
          required: true,
          placeholder: "描述患者的状态、行为或观察到的变化...",
          rows: 4,
        },
      ];
    default:
      return [];
  }
}
