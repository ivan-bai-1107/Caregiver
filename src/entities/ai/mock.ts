import type { AIAssistantResult } from "./model";

export const mockAIResults: AIAssistantResult[] = [
  {
    intent: "create_record",
    answerText: "已为你整理成血压记录草稿，请核对患者、时间和血压数值后再保存。",
    draftType: "care_record",
    draftPayload: {
      patientId: "1",
      recordType: "blood_pressure",
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 85,
    },
  },
  {
    intent: "create_task",
    answerText: "我可以先生成一个每日提醒任务草稿，具体执行逻辑仍由表单确认。",
    draftType: "care_task",
    draftPayload: {
      patientId: "2",
      title: "每日测量血糖",
      repeatRule: "daily",
    },
  },
];
