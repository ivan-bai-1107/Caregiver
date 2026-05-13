import { Edit, Eye, EyeOff, FileText, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { AdminArticleStatus, AdminKnowledgeArticle, AdminKnowledgeArticleDraft } from "@/features/admin/model";
import { adminArticleStatusLabels } from "@/features/admin/model";
import { useAdminContentState } from "@/features/admin/state/useAdminContentState";
import { formatDateTimeLabel } from "@/shared/lib/date";

export function AdminContentPage() {
  const {
    articles,
    categories,
    status,
    keyword,
    editingArticle,
    draft,
    isEditorOpen,
    isLoading,
    isMutating,
    error,
    setStatus,
    setKeyword,
    openCreate,
    openEdit,
    closeEditor,
    updateDraft,
    saveArticle,
    setArticleStatus,
    retry,
  } = useAdminContentState();

  async function handleSave() {
    try {
      const ok = await saveArticle();
      if (ok) {
        toast.success(editingArticle ? "知识文章已更新" : "知识文章已创建");
      }
    } catch {
      toast.error("知识文章保存失败");
    }
  }

  async function handleStatus(article: AdminKnowledgeArticle) {
    const nextStatus: AdminArticleStatus = article.status === "published" ? "archived" : "published";
    try {
      await setArticleStatus(article, nextStatus);
      toast.success(nextStatus === "published" ? "文章已上架" : "文章已下架");
    } catch {
      toast.error("文章状态更新失败");
    }
  }

  function updateNumeric(field: keyof AdminKnowledgeArticleDraft, value: string) {
    updateDraft(field as "readTimeMinutes", Number(value) as AdminKnowledgeArticleDraft["readTimeMinutes"]);
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>知识内容管理</h1>
          <p className="text-gray-500">复用 knowledge_articles，支持新增、编辑、上架和下架。</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          新增文章
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="搜索标题、作者或分类"
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "全部" },
              { key: "published", label: "已上架" },
              { key: "draft", label: "草稿" },
              { key: "archived", label: "已下架" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatus(filter.key as typeof status)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  status === filter.key ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={() => void retry()} className="ml-3 underline">重新加载</button>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">文章</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">作者</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">阅读</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">点赞</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">更新时间</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">状态</th>
              <th className="text-right py-4 px-6 text-sm text-gray-500 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-50">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 line-clamp-1">{article.title}</p>
                      <p className="text-xs text-gray-400">{article.categoryName}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{article.authorName}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{article.viewCount}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{article.likeCount}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{formatDateTimeLabel(article.updatedAt)}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    article.status === "published" ? "bg-green-50 text-green-600" :
                    article.status === "draft" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {adminArticleStatusLabels[article.status]}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(article)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void handleStatus(article)}
                      disabled={isMutating}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                      title={article.status === "published" ? "下架" : "上架"}
                    >
                      {article.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">正在加载知识文章...</div>
        ) : null}
        {!isLoading && articles.length === 0 ? (
          <div className="py-16 text-center text-gray-400">没有找到符合条件的文章</div>
        ) : null}
      </div>

      {isEditorOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={closeEditor}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-xl max-h-[86vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg text-gray-900 mb-5">
              {editingArticle ? "编辑知识文章" : "新增知识文章"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm text-gray-600">
                分类
                <select
                  value={draft.categoryId}
                  onChange={(event) => updateDraft("categoryId", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-600">
                状态
                <select
                  value={draft.status}
                  onChange={(event) => updateDraft("status", event.target.value as AdminArticleStatus)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已上架</option>
                  <option value="archived">已下架</option>
                </select>
              </label>
              <label className="text-sm text-gray-600 col-span-2">
                标题
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                />
              </label>
              <label className="text-sm text-gray-600 col-span-2">
                摘要
                <textarea
                  value={draft.summary}
                  onChange={(event) => updateDraft("summary", event.target.value)}
                  rows={3}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm resize-none"
                />
              </label>
              <label className="text-sm text-gray-600">
                作者
                <input
                  value={draft.authorName}
                  onChange={(event) => updateDraft("authorName", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                />
              </label>
              <label className="text-sm text-gray-600">
                作者头衔
                <input
                  value={draft.authorTitle}
                  onChange={(event) => updateDraft("authorTitle", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                />
              </label>
              <label className="text-sm text-gray-600">
                来源
                <input
                  value={draft.source}
                  onChange={(event) => updateDraft("source", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                />
              </label>
              <label className="text-sm text-gray-600">
                阅读分钟
                <input
                  type="number"
                  min={1}
                  value={draft.readTimeMinutes}
                  onChange={(event) => updateNumeric("readTimeMinutes", event.target.value)}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm"
                />
              </label>
              <label className="text-sm text-gray-600 col-span-2">
                正文
                <textarea
                  value={draft.content}
                  onChange={(event) => updateDraft("content", event.target.value)}
                  rows={10}
                  className="mt-2 w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm resize-none"
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeEditor} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">取消</button>
              <button
                onClick={() => void handleSave()}
                disabled={isMutating || !draft.categoryId || !draft.title.trim()}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
