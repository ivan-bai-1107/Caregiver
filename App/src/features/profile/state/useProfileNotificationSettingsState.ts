import { useEffect, useState } from "react";
import type { UserNotificationSettings } from "@/features/profile/model";
import {
  getUserNotificationSettings,
  updateUserNotificationSettings,
} from "@/features/profile/services/profile.service";

const emptySettings: UserNotificationSettings = {
  taskReminderEnabled: false,
  healthAlertEnabled: false,
  systemNotificationEnabled: false,
};

export function useProfileNotificationSettingsState() {
  const [settings, setSettings] = useState<UserNotificationSettings>(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSavingKey, setIsSavingKey] = useState<keyof UserNotificationSettings | null>(null);

  async function loadSettings() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextSettings = await getUserNotificationSettings();
      setSettings(nextSettings);
    } catch (error) {
      setLoadError("通知设置加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function updateSetting<Key extends keyof UserNotificationSettings>(key: Key, value: UserNotificationSettings[Key]) {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    setIsSavingKey(key);

    try {
      const savedSettings = await updateUserNotificationSettings(nextSettings);
      setSettings(savedSettings);
      return { ok: true as const };
    } catch (error) {
      setSettings(previousSettings);
      return { ok: false as const };
    } finally {
      setIsSavingKey(null);
    }
  }

  return {
    settings,
    isLoading,
    loadError,
    isSavingKey,
    updateSetting,
    retry: loadSettings,
  };
}
