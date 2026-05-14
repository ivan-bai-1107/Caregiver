import { useEffect, useState } from "react";
import type { ForgotPasswordDraft } from "@/features/auth/model";
import { resetPassword, sendEmailCode } from "@/features/auth/services/auth.service";
import { ApiError } from "@/shared/lib/apiClient";

function validateDraft(draft: ForgotPasswordDraft) {
  const fieldErrors: Partial<Record<keyof ForgotPasswordDraft, string>> = {};

  if (!draft.email.trim()) {
    fieldErrors.email = "请输入邮箱地址";
  }

  if (!draft.code.trim()) {
    fieldErrors.code = "请输入验证码";
  }

  if (!draft.password.trim()) {
    fieldErrors.password = "请输入新密码";
  } else if (draft.password.length < 6) {
    fieldErrors.password = "密码至少需要 6 位";
  }

  if (!draft.confirmPassword.trim()) {
    fieldErrors.confirmPassword = "请再次输入新密码";
  } else if (draft.password !== draft.confirmPassword) {
    fieldErrors.confirmPassword = "两次密码输入不一致";
  }

  return fieldErrors;
}

export function useForgotPasswordState() {
  const [draft, setDraft] = useState<ForgotPasswordDraft>({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordDraft, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  function updateDraft<Key extends keyof ForgotPasswordDraft>(key: Key, value: ForgotPasswordDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));

    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: "" }));
    }
  }

  async function requestCode() {
    if (!draft.email.trim()) {
      setFieldErrors((current) => ({ ...current, email: "请先输入邮箱地址" }));
      return { ok: false as const, message: "请先输入邮箱地址" };
    }

    setIsSendingCode(true);
    setFormError(null);

    try {
      await sendEmailCode({ email: draft.email });
      setCountdown(60);
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "验证码发送失败，请稍后重试。";
      setFormError(message);
      return { ok: false as const, message };
    } finally {
      setIsSendingCode(false);
    }
  }

  async function submit() {
    const nextErrors = validateDraft(draft);
    setFieldErrors(nextErrors);
    setFormError(null);

    if (Object.values(nextErrors).some(Boolean)) {
      return { ok: false as const, reason: "validation" as const };
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email: draft.email,
        code: draft.code,
        password: draft.password,
      });
      return { ok: true as const };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "密码重置失败，请稍后重试。";
      setFormError(message);
      return { ok: false as const, reason: "request" as const, message };
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    draft,
    fieldErrors,
    formError,
    isSendingCode,
    isSubmitting,
    countdown,
    updateDraft,
    requestCode,
    submit,
  };
}
