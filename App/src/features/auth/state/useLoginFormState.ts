import { useState } from "react";
import type { LoginDraft } from "@/features/auth/model";
import { login } from "@/features/auth/services/auth.service";
import { ApiError } from "@/shared/lib/apiClient";

function validateDraft(draft: LoginDraft) {
  const fieldErrors: Partial<Record<keyof LoginDraft, string>> = {};

  if (!draft.email.trim()) {
    fieldErrors.email = "请输入邮箱地址";
  }

  if (!draft.password.trim()) {
    fieldErrors.password = "请输入密码";
  }

  return fieldErrors;
}

export function useLoginFormState() {
  const [draft, setDraft] = useState<LoginDraft>({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginDraft, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDraft<Key extends keyof LoginDraft>(key: Key, value: LoginDraft[Key]) {
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
    const nextErrors = validateDraft(draft);
    setFieldErrors(nextErrors);
    setSubmitError(null);

    if (Object.values(nextErrors).some(Boolean)) {
      return {
        ok: false as const,
        reason: "validation" as const,
      };
    }

    setIsSubmitting(true);

    try {
      const user = await login(draft);
      return {
        ok: true as const,
        user,
      };
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "登录失败，请检查账号信息后重试。";
      setSubmitError(message);
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
    submitError,
    isSubmitting,
    updateDraft,
    submit,
  };
}
