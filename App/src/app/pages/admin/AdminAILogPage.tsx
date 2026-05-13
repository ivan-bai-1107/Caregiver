import { useState } from "react";
import { Search, Eye, ChevronDown, Bot, X } from "lucide-react";

const logs = [
  {
    id: 1,
    scene: "care_record",
    sceneName: "护理记录预填",
    user: "护理员小张",
    input: "帮我记录今天上午测量的血压，张明，收缩压130，舒张压85",
    output: '{"patient":"张明","type":"blood_pressure","systolic":130,"diastolic":85,"time":"2026-04-14 上午"}',
    status: "success",
    duration: "1.2s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-14 09:20",
  },
  {
    id: 2,
    scene: "care_task",
    sceneName: "护理任务预填",
    user: "护理员小张",
    input: "帮我创建一个每天早上8点给张明测血压的任务",
    output: '{"patient":"张明","task_type":"blood_pressure","title":"每日测量血压","repeat_rule":"daily","time":"08:00","priority":"normal"}',
    status: "success",
    duration: "1.5s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-14 09:15",
  },
  {
    id: 3,
    scene: "qa",
    sceneName: "护理问答",
    user: "李护士",
    input: "高血压患者在日常饮食上需要注意哪些事项？",
    output: "高血压患者在日常饮食上需注意以下几点：1. 限制钠盐摄入...",
    status: "success",
    duration: "2.1s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-14 08:45",
  },
  {
    id: 4,
    scene: "trend_analysis",
    sceneName: "趋势分析",
    user: "护理员小张",
    input: "[血压数据序列: 135/88, 132/85, 130/85, 128/82, 130/84, 125/80, 127/82]",
    output: "血压整体呈下降趋势，近7天收缩压从135 mmHg降至127 mmHg，控制效果较好...",
    status: "success",
    duration: "1.8s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-13 16:30",
  },
  {
    id: 5,
    scene: "community_review",
    sceneName: "社区审核",
    user: "系统",
    input: "帖子内容：分享一个测血压的小技巧...",
    output: '{"suggestion":"pass","reason":"内容为护理经验分享，未包含诊断建议或药品推荐"}',
    status: "success",
    duration: "0.8s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-13 15:00",
  },
  {
    id: 6,
    scene: "care_record",
    sceneName: "护理记录预填",
    user: "张家属",
    input: "记录一下体温",
    output: '{"error":"信息不足，缺少患者姓名和体温数值"}',
    status: "failed",
    duration: "0.6s",
    model: "gpt-4o-mini",
    createdAt: "2026-04-13 14:20",
  },
];

const sceneOptions = [
  { value: "all", label: "全部场景" },
  { value: "care_record", label: "护理记录预填" },
  { value: "care_task", label: "护理任务预填" },
  { value: "qa", label: "护理问答" },
  { value: "trend_analysis", label: "趋势分析" },
  { value: "community_review", label: "社区审核" },
];

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "success", label: "成功" },
  { value: "failed", label: "失败" },
];

export function AdminAILogPage() {
  const [filterScene, setFilterScene] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailLog, setDetailLog] = useState<(typeof logs)[0] | null>(null);

  const filtered = logs.filter((log) => {
    const matchScene = filterScene === "all" || log.scene === filterScene;
    const matchStatus = filterStatus === "all" || log.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      log.user.includes(searchQuery) ||
      log.input.includes(searchQuery);
    return matchScene && matchStatus && matchSearch;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI 日志管理</h1>
        <p className="text-sm text-gray-500 mt-1">查看所有 AI 调用记录，包括输入、输出、场景和状态</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户或输入内容..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#5B8A72] focus:outline-none text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterScene}
              onChange={(e) => setFilterScene(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-[#5B8A72] focus:outline-none appearance-none pr-10 min-w-[140px]"
            >
              {sceneOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-[#5B8A72] focus:outline-none appearance-none pr-10 min-w-[120px]"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">时间</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">场景</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">用户</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">输入摘要</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">状态</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">耗时</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{log.createdAt}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-[#5B8A72]/10 text-[#5B8A72] text-xs rounded-lg">
                      {log.sceneName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{log.user}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[300px] truncate">{log.input}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-lg ${
                        log.status === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {log.status === "success" ? "成功" : "失败"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{log.duration}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setDetailLog(log)}
                      className="p-2 text-gray-400 hover:text-[#5B8A72] hover:bg-[#5B8A72]/5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bot className="w-12 h-12 text-gray-300" />
            <p className="text-gray-400 text-sm">暂无匹配的日志记录</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        共 {filtered.length} 条记录
      </div>

      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#5B8A72]/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#5B8A72]" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI 日志详情</h3>
                  <p className="text-xs text-gray-400">{detailLog.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">场景</p>
                  <p className="text-sm font-medium">{detailLog.sceneName}</p>
                  <code className="text-xs text-gray-500">{detailLog.scene}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">用户</p>
                  <p className="text-sm font-medium">{detailLog.user}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">状态</p>
                  <span
                    className={`px-2.5 py-1 text-xs rounded-lg ${
                      detailLog.status === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {detailLog.status === "success" ? "成功" : "失败"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">模型 / 耗时</p>
                  <p className="text-sm">{detailLog.model} · {detailLog.duration}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">用户输入</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{detailLog.input}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">AI 输出</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono">{detailLog.output}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}