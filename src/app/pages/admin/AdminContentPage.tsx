import { Search, FileText, MessageSquare, Eye, ThumbsUp, Edit, Trash2, EyeOff } from "lucide-react";
import { useState } from "react";

interface ContentItem {
  id: number;
  type: "knowledge" | "community";
  title: string;
  author: string;
  category: string;
  views: number;
  likes: number;
  publishDate: string;
  status: "published" | "hidden";
}

export function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState("all");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ContentItem | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([
    { id: 1, type: "knowledge", title: "高血压患者的日常护理要点", author: "李医生", category: "慢性病管理", views: 1234, likes: 156, publishDate: "2026-04-10", status: "published" },
    { id: 2, type: "community", title: "分享一个测血压的小技巧", author: "护理员小王", category: "经验分享", views: 456, likes: 24, publishDate: "2026-04-14", status: "published" },
    { id: 3, type: "knowledge", title: "糖尿病患者的血糖监测指南", author: "张护士", category: "慢性病管理", views: 892, likes: 98, publishDate: "2026-04-12", status: "published" },
    { id: 4, type: "community", title: "如何和患者家属有效沟通", author: "资深护工", category: "经验分享", views: 678, likes: 45, publishDate: "2026-04-11", status: "published" },
    { id: 5, type: "knowledge", title: "心脏病患者的运动注意事项", author: "王医生", category: "慢性病管理", views: 745, likes: 87, publishDate: "2026-04-09", status: "hidden" },
    { id: 6, type: "community", title: "护理工作中的安全防护经验", author: "陈护士", category: "护理技巧", views: 523, likes: 38, publishDate: "2026-04-08", status: "published" },
  ]);

  const toggleVisibility = (id: number) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "published" ? "hidden" as const : "published" as const } : c));
  };

  const deleteItem = (id: number) => {
    setContents(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const saveEdit = () => {
    if (editItem && editTitle.trim()) {
      setContents(prev => prev.map(c => c.id === editItem.id ? { ...c, title: editTitle } : c));
      setEditItem(null);
    }
  };

  const filteredContents = contents.filter((c) => {
    const matchesSearch = c.title.includes(searchQuery) || c.author.includes(searchQuery);
    const matchesType = contentType === "all" || c.type === contentType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>内容管理</h1>
        <p className="text-gray-500">管理所有已发布的知识文章和社区帖子</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="搜索标题或作者"
            />
          </div>
          <div className="flex items-center gap-2">
            {[{ key: "all", label: "全部" }, { key: "knowledge", label: "知识文章" }, { key: "community", label: "社区帖子" }].map(f => (
              <button
                key={f.key}
                onClick={() => setContentType(f.key)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  contentType === f.key ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">内容</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">作者</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">阅读</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">点赞</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">发布日期</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">状态</th>
              <th className="text-right py-4 px-6 text-sm text-gray-500 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredContents.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      c.type === "knowledge" ? "bg-blue-50" : "bg-purple-50"
                    }`}>
                      {c.type === "knowledge" ? <FileText className="w-4 h-4 text-blue-600" /> : <MessageSquare className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 line-clamp-1">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.category}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{c.author}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{c.views}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{c.likes}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{c.publishDate}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    c.status === "published" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.status === "published" ? "已发布" : "已隐藏"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => { setEditItem(c); setEditTitle(c.title); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleVisibility(c.id)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title={c.status === "published" ? "隐藏" : "发布"}>
                      {c.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteConfirm(c)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContents.length === 0 && (
          <div className="py-16 text-center text-gray-400">没有找到符合条件的内容</div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg text-gray-900 mb-4">编辑内容</h3>
            <label className="block text-sm text-gray-600 mb-2">标题</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none text-sm mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">取消</button>
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">确认删除？</h3>
            <p className="text-sm text-gray-500 mb-6">删除后将无法恢复「{deleteConfirm.title}」。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm">取消</button>
              <button onClick={() => deleteItem(deleteConfirm.id)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
