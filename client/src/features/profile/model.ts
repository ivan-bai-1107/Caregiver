export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
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
  avatarUrl: string;
  emailCode: string;
}

export interface UserPasswordDraft {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfileValidationResult {
  isValid: boolean;
  fieldErrors: Partial<Record<keyof UserProfileDraft, string>>;
}

export function createUserProfileDraft(profile?: UserProfile): UserProfileDraft {
  return {
    username: profile?.username ?? "",
    email: profile?.email ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    emailCode: "",
  };
}

export function validateUserProfileDraft(draft: UserProfileDraft, originalEmail = ""): UserProfileValidationResult {
  const fieldErrors: UserProfileValidationResult["fieldErrors"] = {};

  if (!draft.username.trim()) {
    fieldErrors.username = "请输入用户名";
  }

  if (!draft.email.trim()) {
    fieldErrors.email = "请输入邮箱地址";
  }

  if (draft.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase() && !draft.emailCode.trim()) {
    fieldErrors.emailCode = "请输入新邮箱验证码";
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export function createUserPasswordDraft(): UserPasswordDraft {
  return {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

export function validateUserPasswordDraft(draft: UserPasswordDraft) {
  const fieldErrors: Partial<Record<keyof UserPasswordDraft, string>> = {};

  if (!draft.currentPassword.trim()) {
    fieldErrors.currentPassword = "请输入当前密码";
  }

  if (!draft.newPassword.trim()) {
    fieldErrors.newPassword = "请输入新密码";
  } else if (draft.newPassword.length < 6) {
    fieldErrors.newPassword = "新密码至少需要 6 位";
  }

  if (!draft.confirmPassword.trim()) {
    fieldErrors.confirmPassword = "请再次输入新密码";
  } else if (draft.newPassword !== draft.confirmPassword) {
    fieldErrors.confirmPassword = "两次密码输入不一致";
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}
