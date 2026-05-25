import type {
  UserNotificationSettings,
  UserPasswordDraft,
  UserPreferences,
  UserProfile,
  UserProfileDraft,
  UserStats,
} from "@/features/profile/model";
import { env } from "@/shared/constants/env";
import { apiClient } from "@/shared/lib/apiClient";
import { getAuthToken, setCurrentUser } from "@/shared/lib/auth";

interface UserProfileDto {
  id?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
}

interface UserStatsDto {
  patientCount?: number;
  recordCount?: number;
  taskCompletedCount?: number;
  taskPendingCount?: number;
}

interface UserNotificationSettingsDto {
  taskReminderEnabled?: boolean;
  healthAlertEnabled?: boolean;
  systemNotificationEnabled?: boolean;
}

interface UserPreferencesDto {
  theme?: string;
  language?: string;
}

function toUserProfile(dto: UserProfileDto): UserProfile {
  return {
    id: String(dto.id ?? ""),
    username: String(dto.username ?? ""),
    email: String(dto.email ?? ""),
    avatarUrl: String(dto.avatarUrl ?? ""),
  };
}

export function resolveProfileMediaUrl(url: string) {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }

  const apiOrigin = new URL(env.apiBaseUrl).origin;
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

function toUserStats(dto: UserStatsDto): UserStats {
  return {
    patientCount: Number(dto.patientCount ?? 0),
    recordCount: Number(dto.recordCount ?? 0),
    taskCompletedCount: Number(dto.taskCompletedCount ?? 0),
    taskPendingCount: Number(dto.taskPendingCount ?? 0),
  };
}

function toUserNotificationSettings(dto: UserNotificationSettingsDto): UserNotificationSettings {
  return {
    taskReminderEnabled: Boolean(dto.taskReminderEnabled),
    healthAlertEnabled: Boolean(dto.healthAlertEnabled),
    systemNotificationEnabled: Boolean(dto.systemNotificationEnabled),
  };
}

function toUserPreferences(dto: UserPreferencesDto): UserPreferences {
  return {
    theme: String(dto.theme ?? "system"),
    language: String(dto.language ?? "zh-CN"),
  };
}

export function applyUserPreferences(preferences: UserPreferences) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  const shouldUseDark = preferences.theme === "dark" || (preferences.theme === "system" && prefersDark);

  root.classList.toggle("dark", shouldUseDark);
  root.lang = preferences.language || "zh-CN";
}

export async function getUserProfile() {
  const response = await apiClient.get<UserProfileDto>("/api/users/me");
  return toUserProfile(response);
}

export async function updateUserProfile(draft: UserProfileDraft) {
  const response = await apiClient.put<UserProfileDto>("/api/users/me", {
    username: draft.username.trim(),
    email: draft.email.trim(),
    emailCode: draft.emailCode.trim() || undefined,
  });
  const profile = toUserProfile(response);
  setCurrentUser(profile);
  return profile;
}

export async function updateUserPassword(draft: UserPasswordDraft) {
  return apiClient.put<null>("/api/users/me/password", {
    currentPassword: draft.currentPassword,
    newPassword: draft.newPassword,
  });
}

export async function updateUserAvatar(imageData: string) {
  const token = getAuthToken();
  const response = await fetch(`${env.apiBaseUrl}/api/users/me/avatar`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: JSON.stringify({ imageData }),
  });
  const payload = await response.json();

  if (!response.ok || payload?.success === false) {
    throw new Error(String(payload?.message ?? "头像上传失败，请稍后重试。"));
  }

  const profile = toUserProfile(payload.data ?? {});
  setCurrentUser(profile);
  return profile;
}

export async function getUserStats() {
  const response = await apiClient.get<UserStatsDto>("/api/users/me/stats");
  return toUserStats(response);
}

export async function getUserNotificationSettings() {
  const response = await apiClient.get<UserNotificationSettingsDto>("/api/users/me/notification-settings");
  return toUserNotificationSettings(response);
}

export async function updateUserNotificationSettings(settings: UserNotificationSettings) {
  const response = await apiClient.put<UserNotificationSettingsDto>(
    "/api/users/me/notification-settings",
    {
      taskReminderEnabled: settings.taskReminderEnabled,
      healthAlertEnabled: settings.healthAlertEnabled,
      systemNotificationEnabled: settings.systemNotificationEnabled,
    },
  );

  return toUserNotificationSettings(response);
}

export async function getUserPreferences() {
  const response = await apiClient.get<UserPreferencesDto>("/api/users/me/preferences");
  const preferences = toUserPreferences(response);
  applyUserPreferences(preferences);
  return preferences;
}

export async function updateUserPreferences(preferences: UserPreferences) {
  const response = await apiClient.put<UserPreferencesDto>("/api/users/me/preferences", {
    theme: preferences.theme,
    language: preferences.language,
  });

  const savedPreferences = toUserPreferences(response);
  applyUserPreferences(savedPreferences);
  return savedPreferences;
}
