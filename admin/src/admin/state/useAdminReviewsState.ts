import { useEffect, useMemo, useState } from "react";
import type { AdminReviewItem } from "@admin/model";
import type { CommunityReviewStatus } from "@/features/community/model";
import {
  listAdminReviewPosts,
  updateAdminReviewPost,
} from "@admin/services/admin.service";

export function useAdminReviewsState() {
  const [status, setStatus] = useState<CommunityReviewStatus>("pending");
  const [items, setItems] = useState<AdminReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAdminReviewPosts({ status, page: 1, pageSize: 50 });
      setItems((response.items ?? []).map((item) => ({ type: "post", item })));
      setTotal(Number(response.total ?? 0));
    } catch {
      setError("审核列表加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [status]);

  async function updateReview(item: AdminReviewItem, nextStatus: CommunityReviewStatus, reason = "") {
    setIsMutating(true);
    try {
      await updateAdminReviewPost(item.item.id, { status: nextStatus, reason });
      await loadReviews();
    } finally {
      setIsMutating(false);
    }
  }

  const countsLabel = useMemo(() => `${total} 条`, [total]);

  return {
    status,
    items,
    total,
    countsLabel,
    isLoading,
    isMutating,
    error,
    setStatus,
    updateReview,
    retry: loadReviews,
  };
}
