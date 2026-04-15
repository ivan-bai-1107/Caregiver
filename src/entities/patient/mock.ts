import type { Patient } from "./model";

export const mockPatients: Patient[] = [
  {
    id: "1",
    userId: "user-zhangming",
    name: "张明",
    age: 68,
    gender: "男",
    profileNote:
      "高血压病史较长，当前护理重点是稳定血压监测节奏、保证规律用药，并关注情绪和活动后反应。",
  },
  {
    id: "2",
    userId: "user-lihua",
    name: "李华",
    age: 72,
    gender: "女",
    profileNote:
      "以血糖管理和饮食观察为主，需要保持餐后记录的一致性，并及时跟进服药依从性。",
  },
  {
    id: "3",
    userId: "user-wangfang",
    name: "王芳",
    age: 65,
    gender: "女",
    profileNote:
      "处于康复期，当前更关注日常活动、训练完成度和疲劳反馈，记录要尽量连续和简洁。",
  },
  {
    id: "4",
    userId: "user-zhaoqiang",
    name: "赵强",
    age: 70,
    gender: "男",
    profileNote:
      "需要持续观察心率与活动状态，护理说明以节律平稳和避免过度疲劳为中心。",
  },
];
