import { useEffect, useState } from "react";
import type { RegisterDraft } from "@/features/auth/model";
import { register, sendEmailCode } from "@/features/auth/services/auth.service";
import { ApiError } from "@/shared/lib/apiClient";

function validateDraft(draft: RegisterDraft) {
  const fieldErrors: Partial<Record<keyof RegisterDraft, string>> = {};

  if (!draft.username.trim()) {
    fieldErrors.username = "请输入用户名";
  }

  if (!draft.email.trim()) {
    fieldErrors.email = "请输入邮箱地址";
  }

  if (!draft.code.trim()) {
    fieldErrors.code = "请输入验证码";
  }

  if (!draft.password.trim()) {
    fieldErrors.password = "请输入密码";
  }

  if (!draft.confirmPassword.trim()) {
    fieldErrors.confirmPassword = "请再次输入密码";
  } else if (draft.password !== draft.confirmPassword) {
    fieldErrors.confirmPassword = "两次密码输入不一致";
  }

  return fieldErrors;
}

export function useRegisterFormState() {
  const [draft, setDraft] = useState<RegisterDraft>({
    username: "",
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterDraft, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((currentCountdown) => currentCountdown - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function updateDraft<Key extends keyof RegisterDraft>(key: Key, value: RegisterDraft[Key]) {
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

  async function requestCode() {
    if (!draft.email.trim()) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        email: "请先输入邮箱地址",
      }));
      return {
        ok: false as const,
        message: "请先输入邮箱地址",
      };
    }

    setIsSendingCode(true);
    setFormError(null);

    try {
      await sendEmailCode({ email: draft.email });
      setCountdown(60);
      return {
        ok: true as const,
      };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "验证码发送失败，请稍后重试。";
      setFormError(message);
      return {
        ok: false as const,
        message,
      };
    } finally {
      setIsSendingCode(false);
    }
  }

  async function submit() {
    const nextErrors = validateDraft(draft);
    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.values(nextErrors).some(Boolean)) {
      return {
        ok: false as const,
        reason: "validation" as const,
      };
    }

    setIsSubmitting(true);

    try {
      const user = await register({
        username: draft.username,
        email: draft.email,
        code: draft.code,
        password: draft.password,
      });

      return {
        ok: true as const,
        user,
      };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "注册失败，请检查信息后重试。";
      setFormError(message);
      return {
        ok: false as const,
        reason: "request" as const,
        message,
      };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    draft,
    fieldErrors,
    formError,
    isSubmitting,
    isSendingCode,
    countdown,
    updateDraft,
    requestCode,
    submit,
  };
}
