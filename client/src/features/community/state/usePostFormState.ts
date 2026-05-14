import { useState } from "react";
import type { CommunityPostDraft } from "@/features/community/model";
import { createCommunityPost } from "@/features/community/services/community.service";

export function usePostFormState() {
  const [draft, setDraft] = useState<CommunityPostDraft>({
    title: "",
    content: "",
    tag: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CommunityPostDraft>(field: K, value: CommunityPostDraft[K]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit() {
    setIsSubmitting(true);
    setError(null);
    try {
      return await createCommunityPost(draft);
    } catch {
      setError("帖子提交失败，请稍后重试。");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    draft,
    isSubmitting,
    error,
    updateField,
    submit,
  };
}
