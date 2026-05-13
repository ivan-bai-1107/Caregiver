import type {
  UserNotificationSettings,
  UserPreferences,
  UserProfile,
  UserProfileDraft,
  UserStats,
} from "@/features/profile/model";
import { apiClient } from "@/shared/lib/apiClient";
import { setCurrentUser } from "@/shared/lib/auth";

interface UserProfileDto {
  id?: string;
  username?: string;
  email?: string;
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
  };
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

export async function getUserProfile() {
  const response = await apiClient.get<UserProfileDto>("/api/users/me");
  return toUserProfile(response);
}

export async function updateUserProfile(draft: UserProfileDraft) {
  const response = await apiClient.put<UserProfileDto>("/api/users/me", {
    username: draft.username.trim(),
    email: draft.email.trim(),
  });
  const profile = toUserProfile(response);
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
  return toUserPreferences(response);
}

export async function updateUserPreferences(preferences: UserPreferences) {
  const response = await apiClient.put<UserPreferencesDto>("/api/users/me/preferences", {
    theme: preferences.theme,
    language: preferences.language,
  });

  return toUserPreferences(response);
}
