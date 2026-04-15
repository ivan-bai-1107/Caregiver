import { useState } from "react";
import { Sparkles, Edit2, Check, X, ToggleLeft, ToggleRight, Plus } from "lucide-react";

const initialPrompts = [
  {
    id: 1,
    sceneCode: "care_record_prefill",
    sceneName: "护理记录预填写",
    version: "v1.2",
    isActive: true,
    content: "你是一个护理记录助手。根据用户的自然语言描述，提取以下结构化字段：患者姓名、记录类型（blood_pressure/temperature/blood_sugar/heart_rate/medication/diet/other）、指标数值及单位、记录时间。返回 JSON 格式。",
    updatedAt: "2026-04-12 14:30",
  },
  {
    id: 2,
    sceneCode: "care_task_prefill",
    sceneName: "护理任务预填写",
    version: "v1.1",
    isActive: true,
    content: "你是一个护理任务助手。根据用户描述，提取以下字段：患者姓名、任务类型（task_type）、任务标题、任务描述、提醒时间、周期规则（once/daily/weekly/monthly）、优先级（low/normal/high）。返回 JSON 格式。",
    updatedAt: "2026-04-10 09:15",
  },
  {
    id: 3,
    sceneCode: "care_qa",
    sceneName: "护理问答",
    version: "v2.0",
    isActive: true,
    content: "你是一个专业护理顾问。回答用户关于日常护理的问题，提供基于循证医学的护理建议。注意：不提供诊断、处方或药物剂量建议。每次回答末尾添加免责声明。",
    updatedAt: "2026-04-11 16:45",
  },
  {
    id: 4,
    sceneCode: "trend_analysis",
    sceneName: "趋势分析说明",
    version: "v1.0",
    isActive: true,
    content: "你是一个健康数据分析助手。根据提供的时间序列数据，生成趋势概述、波动说明、异常提示和护理建议四个部分。不提供诊断性结论。",
    updatedAt: "2026-04-08 11:20",
  },
  {
    id: 5,
    sceneCode: "community_review",
    sceneName: "社区审核辅助",
    version: "v1.0",
    isActive: false,
    content: "你是一个内容审核助手。检查社区帖子是否包含以下违规内容：医疗诊断建议、药品推荐、广告推广、不当言论。返回审核建议（pass/reject）及理由。",
    updatedAt: "2026-04-05 08:00",
  },
];

export function AdminPromptPage() {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleToggle = (id: number) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleEdit = (id: number) => {
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) {
      setEditingId(id);
      setEditContent(prompt.content);
    }
  };

  const handleSave = (id: number) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, content: editContent, updatedAt: "2026-04-15 10:00", version: `v${(parseFloat(p.version.slice(1)) + 0.1).toFixed(1)}` }
          : p
      )
    );
    setEditingId(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Prompt 模板管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理各场景的 AI Prompt 模板，支持版本控制和启用/停用</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#5B8A72] text-white rounded-xl hover:bg-[#4A7A62] transition-colors">
          <Plus className="w-4 h-4" />
          新增模板
        </button>
      </div>

      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5B8A72]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#5B8A72]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{prompt.sceneName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{prompt.sceneCode}</code>
                      <span className="text-xs bg-[#5B8A72]/10 text-[#5B8A72] px-2 py-0.5 rounded">{prompt.version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(prompt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      prompt.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {prompt.isActive ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {prompt.isActive ? "已启用" : "已停用"}
                  </button>
                  {editingId === prompt.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSave(prompt.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(prompt.id)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {editingId === prompt.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#5B8A72] focus:outline-none text-sm resize-none"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{prompt.content}</p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>最后更新：{prompt.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}