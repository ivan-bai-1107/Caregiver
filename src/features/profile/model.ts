export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

export interface UserStats {
  patientCount: number;
  recordCount: number;
  taskCompletedCount: number;
  taskPendingCount: number;
}

export interface UserNotificationSettings {
  taskReminderEnabled: boolean;
  healthAlertEnabled: boolean;
  systemNotificationEnabled: boolean;
}

export interface UserPreferences {
  theme: string;
  language: string;
}

export interface UserProfileDraft {
  username: string;
  email: string;
}

export interface UserProfileValidationResult {
  isValid: boolean;
  fieldErrors: Partial<Record<keyof UserProfileDraft, string>>;
}

export function createUserProfileDraft(profile?: UserProfile): UserProfileDraft {
  return {
    username: profile?.username ?? "",
    email: profile?.email ?? "",
  };
}

export function validateUserProfileDraft(draft: UserProfileDraft): UserProfileValidationResult {
  const fieldErrors: UserProfileValidationResult["fieldErrors"] = {};

  if (!draft.username.trim()) {
    fieldErrors.username = "请输入用户名";
  }

  if (!draft.email.trim()) {
    fieldErrors.email = "请输入邮箱地址";
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}
