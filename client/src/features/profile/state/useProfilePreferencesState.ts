import { useEffect, useState } from "react";
import type { UserPreferences } from "@/features/profile/model";
import { getUserPreferences, updateUserPreferences } from "@/features/profile/services/profile.service";

const emptyPreferences: UserPreferences = {
  theme: "system",
  language: "zh-CN",
};

export function useProfilePreferencesState() {
  const [preferences, setPreferences] = useState<UserPreferences>(emptyPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPreferences() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextPreferences = await getUserPreferences();
      setPreferences(nextPreferences);
    } catch (error) {
      setLoadError("偏好设置加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPreferences();
  }, []);

  function updatePreference<Key extends keyof UserPreferences>(key: Key, value: UserPreferences[Key]) {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }));
  }

  async function submit() {
    setIsSubmitting(true);

    try {
      const savedPreferences = await updateUserPreferences(preferences);
      setPreferences(savedPreferences);
      return { ok: true as const };
    } catch (error) {
      return { ok: false as const };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    preferences,
    isLoading,
    loadError,
    isSubmitting,
    updatePreference,
    submit,
    retry: loadPreferences,
  };
}
