import { FileText, MessageSquare, Check, X, Eye, Clock } from "lucide-react";
import { useState } from "react";

interface ReviewItem {
  id: number;
  type: "knowledge" | "community";
  title: string;
  author: string;
  authorRole: string;
  category: string;
  submitTime: string;
  status: "pending" | "approved" | "rejected";
  content: string;
  rejectReason?: string;
}

export function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [previewItem, setPreviewItem] = useState<ReviewItem | null>(null);
  const [rejectModal, setRejectModal] = useState<ReviewItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([
    { id: 1, type: "knowledge", title: "老年痴呆症早期识别与护理完全指南", author: "李医生", authorRole: "心血管内科 · 主任医师", category: "慢性病管理", submitTime: "2026-04-14 10:30", status: "pending", content: "阿尔茨海默病（老年痴呆症）是一种进行性发展的神经退行性疾病。早期识别的关键在于观察日常行为变化，如记忆力下降、语言能力退化、判断力减弱等。本文从识别、日常护理、用药管理、情绪疏导四个方面进行详细阐述，帮助照顾者更好地应对。" },
    { id: 2, type: "community", title: "护理老人的心理健康经验分享", author: "护理员小王", authorRole: "从业5年", category: "经验分享", submitTime: "2026-04-14 09:15", status: "pending", content: "在长期护理工作中，我发现老人的心理健康同样重要。以下是我总结的一些经验：定期与老人聊天，了解他们的想法和感受；鼓励老人参与力所能及的活动；注意观察情绪变化，及时疏导。" },
    { id: 3, type: "knowledge", title: "糖尿病足部护理完全指南", author: "张护士", authorRole: "内分泌科 · 护师", category: "专科护理", submitTime: "2026-04-14 08:45", status: "pending", content: "糖尿病患者的足部护理至关重要，正确的护理可以预防严重并发症。包括每日足部检查、正确洗脚方式、合适鞋袜选择、指甲护理要点等。" },
    { id: 4, type: "knowledge", title: "高血压患者的饮食管理", author: "王医生", authorRole: "营养科 · 主治医师", category: "慢性病管理", submitTime: "2026-04-13 16:20", status: "approved", content: "高血压患者的饮食管理是控制血压的重要环节..." },
    { id: 5, type: "community", title: "如何应对老人夜间失眠", author: "陈护工", authorRole: "从业3年", category: "护理技巧", submitTime: "2026-04-13 14:10", status: "rejected", content: "老人失眠是常见问题...", rejectReason: "内容不够专业，建议补充医学依据后重新提交" },
  ]);

  const approveItem = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
    setPreviewItem(null);
  };

  const rejectItem = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" as const, rejectReason: rejectReason || "不符合发布标准" } : r));
    setRejectModal(null);
    setRejectReason("");
    setPreviewItem(null);
  };

  const filteredReviews = reviews.filter((r) => r.status === activeTab);
  const pendingCount = reviews.filter(r => r.status === "pending").length;

  const tabs = [
    { key: "pending", label: "待审核", count: pendingCount },
    { key: "approved", label: "已通过", count: reviews.filter(r => r.status === "approved").length },
    { key: "rejected", label: "已拒绝", count: reviews.filter(r => r.status === "rejected").length },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>内容审核</h1>
        <p className="text-gray-500">审核用户提交的知识文章和社区帖子</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 ${
              activeTab === tab.key ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? "bg-white/20" : "bg-gray-100"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                review.type === "knowledge" ? "bg-blue-50" : "bg-purple-50"
              }`}>
                {review.type === "knowledge" ? <FileText className="w-5 h-5 text-blue-600" /> : <MessageSquare className="w-5 h-5 text-purple-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 text-xs rounded-lg ${
                    review.type === "knowledge" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                  }`}>
                    {review.type === "knowledge" ? "知识文章" : "社区帖子"}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs rounded-lg bg-gray-100 text-gray-500">{review.category}</span>
                </div>
                <h3 className="text-gray-900 mb-2">{review.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{review.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{review.author} · {review.authorRole}</span>
                  <span>{review.submitTime}</span>
                </div>
                {review.status === "rejected" && review.rejectReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                    <strong>拒绝原因：</strong>{review.rejectReason}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setPreviewItem(review)} className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> 查看
                </button>
                {review.status === "pending" && (
                  <>
                    <button onClick={() => approveItem(review.id)} className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> 通过
                    </button>
                    <button onClick={() => { setRejectModal(review); setRejectReason(""); }} className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1.5">
                      <X className="w-4 h-4" /> 拒绝
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center text-gray-400">
            暂无{tabs.find(t => t.key === activeTab)?.label}的内容
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 text-xs rounded-lg ${
                previewItem.type === "knowledge" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
              }`}>
                {previewItem.type === "knowledge" ? "知识文章" : "社区帖子"}
              </span>
              <span className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">{previewItem.category}</span>
            </div>
            <h2 className="text-xl text-gray-900 mb-3" style={{ fontFamily: 'var(--font-display)' }}>{previewItem.title}</h2>
            <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
              <span>{previewItem.author}</span>
              <span>{previewItem.authorRole}</span>
              <span>{previewItem.submitTime}</span>
            </div>
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">{previewItem.content}</p>
            </div>
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button onClick={() => setPreviewItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">关闭</button>
              {previewItem.status === "pending" && (
                <>
                  <button onClick={() => approveItem(previewItem.id)} className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm">通过</button>
                  <button onClick={() => { setRejectModal(previewItem); setRejectReason(""); }} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm">拒绝</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h3 className="text-lg text-gray-900 mb-2">拒绝内容</h3>
            <p className="text-sm text-gray-500 mb-4">请填写拒绝原因，方便作者修改后重新提交。</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none resize-none text-sm"
              placeholder="请输入拒绝原因..."
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={() => rejectItem(rejectModal.id)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm">确认拒绝</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
