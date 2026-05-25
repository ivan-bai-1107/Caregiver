import { useEffect, useState } from "react";
import {
  createUserPasswordDraft,
  createUserProfileDraft,
  validateUserPasswordDraft,
  validateUserProfileDraft,
  type UserPasswordDraft,
  type UserProfileDraft,
} from "@/features/profile/model";
import {
  getUserProfile,
  updateUserAvatar,
  updateUserPassword,
  updateUserProfile,
} from "@/features/profile/services/profile.service";
import { sendEmailCode } from "@/features/auth/services/auth.service";
import { ApiError } from "@/shared/lib/apiClient";

export function useProfileInfoState() {
  const [profileId, setProfileId] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [draft, setDraft] = useState<UserProfileDraft>(createUserProfileDraft());
  const [passwordDraft, setPasswordDraft] = useState<UserPasswordDraft>(createUserPasswordDraft());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserProfileDraft, string>>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Partial<Record<keyof UserPasswordDraft, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0);

  async function loadProfile() {
    setIsLoading(true);
    setLoadError(null);

    try {
      const profile = await getUserProfile();
      setProfileId(profile.id);
      setOriginalEmail(profile.email);
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

  useEffect(() => {
    if (emailCodeCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setEmailCodeCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [emailCodeCountdown]);

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

  function updatePasswordDraft<Key extends keyof UserPasswordDraft>(key: Key, value: UserPasswordDraft[Key]) {
    setPasswordDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));

    if (passwordFieldErrors[key]) {
      setPasswordFieldErrors((currentErrors) => ({
        ...currentErrors,
        [key]: "",
      }));
    }
  }

  async function requestEmailCode() {
    const nextEmail = draft.email.trim();
    if (!nextEmail) {
      setFieldErrors((current) => ({ ...current, email: "请先输入新邮箱地址" }));
      return { ok: false as const, message: "请先输入新邮箱地址" };
    }
    if (nextEmail.toLowerCase() === originalEmail.toLowerCase()) {
      setFieldErrors((current) => ({ ...current, email: "邮箱未发生变化" }));
      return { ok: false as const, message: "邮箱未发生变化" };
    }

    setIsSendingEmailCode(true);
    try {
      await sendEmailCode({ email: nextEmail });
      setEmailCodeCountdown(60);
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "验证码发送失败，请稍后重试。";
      return { ok: false as const, message };
    } finally {
      setIsSendingEmailCode(false);
    }
  }

  async function submit() {
    const validation = validateUserProfileDraft(draft, originalEmail);
    setFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      return {
        ok: false as const,
        validation,
        message: "请先完善个人资料",
      };
    }

    setIsSubmitting(true);

    try {
      const profile = await updateUserProfile(draft);
      setProfileId(profile.id);
      setOriginalEmail(profile.email);
      setDraft(createUserProfileDraft(profile));

      return {
        ok: true as const,
        profile,
      };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "个人资料保存失败，请稍后重试。";
      return { ok: false as const, validation, message };
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitPassword() {
    const validation = validateUserPasswordDraft(passwordDraft);
    setPasswordFieldErrors(validation.fieldErrors);

    if (!validation.isValid) {
      return {
        ok: false as const,
        validation,
        message: "请先完善密码信息",
      };
    }

    setIsPasswordSubmitting(true);
    try {
      await updateUserPassword(passwordDraft);
      setPasswordDraft(createUserPasswordDraft());
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "密码修改失败，请稍后重试。";
      return { ok: false as const, validation, message };
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  async function uploadAvatar(imageData: string) {
    setIsUploadingAvatar(true);

    try {
      const profile = await updateUserAvatar(imageData);
      setProfileId(profile.id);
      setDraft(createUserProfileDraft(profile));
      return { ok: true as const, profile };
    } catch (error) {
      return { ok: false as const };
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return {
    profileId,
    originalEmail,
    draft,
    passwordDraft,
    fieldErrors,
    passwordFieldErrors,
    isLoading,
    loadError,
    isSubmitting,
    isPasswordSubmitting,
    isUploadingAvatar,
    isSendingEmailCode,
    emailCodeCountdown,
    updateDraft,
    updatePasswordDraft,
    uploadAvatar,
    requestEmailCode,
    submit,
    submitPassword,
    retry: loadProfile,
  };
}
