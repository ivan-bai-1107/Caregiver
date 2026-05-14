import { useState } from "react";
import { Check, Eye, FileText, X } from "lucide-react";
import { toast } from "sonner";
import type { AdminReviewItem } from "@admin/model";
import { adminReviewStatusLabels } from "@admin/model";
import { useAdminReviewsState } from "@admin/state/useAdminReviewsState";
import type { CommunityReviewStatus } from "@/features/community/model";
import { getCommunityTagLabel } from "@/features/community/model";
import { formatDateTimeLabel } from "@/shared/lib/date";

function getReviewTitle(item: AdminReviewItem) {
  return item.item.title;
}

function getReviewContent(item: AdminReviewItem) {
  return item.item.content;
}

function getReviewMeta(item: AdminReviewItem) {
  return getCommunityTagLabel(item.item.tag);
}

export function AdminReviewsPage() {
  const {
    status,
    items,
    countsLabel,
    isLoading,
    isMutating,
    error,
    setStatus,
    updateReview,
    retry,
  } = useAdminReviewsState();
  const [previewItem, setPreviewItem] = useState<AdminReviewItem | null>(null);
  const [rejectItem, setRejectItem] = useState<AdminReviewItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleReview(item: AdminReviewItem, nextStatus: CommunityReviewStatus, reason = "") {
    try {
      await updateReview(item, nextStatus, reason);
      setPreviewItem(null);
      setRejectItem(null);
      setRejectReason("");
      toast.success(nextStatus === "passed" ? "内容已通过" : "内容已拒绝");
    } catch {
      toast.error("审核操作失败，请稍后重试");
    }
  }

  const statusTabs: CommunityReviewStatus[] = ["pending", "passed", "rejected"];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>内容审核</h1>
      </div>

      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm transition-colors ${
                status === tab ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {adminReviewStatusLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={() => void retry()} className="ml-3 underline">重新加载</button>
        </div>
      ) : null}

      <div className="mb-4 text-sm text-gray-500">{countsLabel}</div>

      <div className="space-y-4">
        {items.map((review) => {
          return (
            <div key={`${review.type}-${review.item.id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 text-xs rounded-lg bg-gray-100 text-gray-500">
                      社区帖子
                    </span>
                    <span className="px-2.5 py-0.5 text-xs rounded-lg bg-primary/10 text-primary">
                      {getReviewMeta(review)}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs rounded-lg bg-orange-50 text-orange-600">
                      {adminReviewStatusLabels[review.item.status]}
                    </span>
                  </div>
                  <h3 className="text-gray-900 mb-2">{getReviewTitle(review)}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{getReviewContent(review)}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{review.item.author.username}</span>
                    <span>{formatDateTimeLabel(review.item.createdAt)}</span>
                  </div>
                  {review.item.status === "rejected" && review.item.reviewReason ? (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                      <strong>拒绝原因：</strong>{review.item.reviewReason}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewItem(review)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> 查看
                  </button>
                  {review.item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => void handleReview(review, "passed")}
                        disabled={isMutating}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> 通过
                      </button>
                      <button
                        onClick={() => { setRejectItem(review); setRejectReason(""); }}
                        disabled={isMutating}
                        className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> 拒绝
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center text-gray-400">
            正在加载审核内容...
          </div>
        ) : null}
        {!isLoading && items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center text-gray-400">
            暂无{adminReviewStatusLabels[status]}内容
          </div>
        ) : null}
      </div>

      {previewItem ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary">
                社区帖子
              </span>
              <span className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">
                {getReviewMeta(previewItem)}
              </span>
            </div>
            <h2 className="text-xl text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              {getReviewTitle(previewItem)}
            </h2>
            <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
              <span>{previewItem.item.author.username}</span>
              <span>{formatDateTimeLabel(previewItem.item.createdAt)}</span>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-8">{getReviewContent(previewItem)}</p>
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button onClick={() => setPreviewItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">关闭</button>
              {previewItem.item.status === "pending" ? (
                <>
                  <button onClick={() => void handleReview(previewItem, "passed")} className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm">通过</button>
                  <button onClick={() => { setRejectItem(previewItem); setRejectReason(""); }} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm">拒绝</button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {rejectItem ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h3 className="text-lg text-gray-900 mb-2">拒绝内容</h3>
            <p className="text-sm text-gray-500 mb-4">请填写拒绝原因，方便作者修改后重新提交。</p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none resize-none text-sm"
              placeholder="请输入拒绝原因..."
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={() => void handleReview(rejectItem, "rejected", rejectReason || "不符合发布规范")} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm">确认拒绝</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
