import { useEffect, useState } from "react";
import {
  createUserProfileDraft,
  validateUserProfileDraft,
  type UserProfileDraft,
} from "@/features/profile/model";
import { getUserProfile, updateUserProfile } from "@/features/profile/services/profile.service";

export function useProfileInfoState() {
  const [profileId, setProfileId] = useState("");
  const [draft, setDraft] = useState<UserProfileDraft>(createUserProfileDraft());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserProfileDraft, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const profile = await getUserProfile();
      setProfileId(profile.id);
      setDraft(createUserProfileDraft(profile));
    } catch (error) {
      setLoadError("个人资料加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function updateDraft<Key extends keyof UserProfileDraft>(key: Key, value: UserProfileDraft[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));

    if (fieldErrors[key]) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [key]: "",
      }));
    }
  }

  async function submit() {
    const validation = validateUserProfileDraft(draft);
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      return {
        ok: false as const,
        validation,
      };
    }

    setIsSubmitting(true);

    try {
      const profile = await updateUserProfile(draft);
      setProfileId(profile.id);
      setDraft(createUserProfileDraft(profile));

      return {
        ok: true as const,
        profile,
      };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    profileId,
    draft,
    fieldErrors,
    isLoading,
    loadError,
    isSubmitting,
    updateDraft,
    submit,
    retry: loadProfile,
  };
}
