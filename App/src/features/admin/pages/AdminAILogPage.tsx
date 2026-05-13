import { Bot, Eye, X } from "lucide-react";
import { useAdminAiLogsState } from "@/features/admin/state/useAdminAiLogsState";
import { formatDateTimeLabel } from "@/shared/lib/date";

const intentOptions = [
  { value: "", label: "全部意图" },
  { value: "qa", label: "护理问答" },
  { value: "care_record", label: "记录草稿" },
  { value: "care_task", label: "任务草稿" },
  { value: "form_prefill", label: "表单预填" },
];

function getIntentLabel(intent: string) {
  return intentOptions.find((option) => option.value === intent)?.label ?? intent;
}

export function AdminAILogPage() {
  const {
    logs,
    intent,
    total,
    selectedLog,
    isLoading,
    error,
    setIntent,
    setSelectedLog,
    retry,
  } = useAdminAiLogsState();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">AI 日志管理</h1>
        <p className="text-sm text-gray-500 mt-1">读取真实 ai_assistant_logs，仅做审计查看。</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            className="px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none min-w-[160px]"
          >
            {intentOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">共 {total} 条记录</span>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={() => void retry()} className="ml-3 underline">重新加载</button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">时间</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">意图</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">用户</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">输入摘要</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">草稿类型</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDateTimeLabel(log.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                      {getIntentLabel(log.intent)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{log.username || log.userId}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[360px] truncate">{log.message}</td>
                  <td className="px-5 py-4 text-gray-500">{log.draftType ?? "无"}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bot className="w-12 h-12 text-gray-300" />
            <p className="text-gray-400 text-sm">正在加载 AI 日志...</p>
          </div>
        ) : null}
        {!isLoading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bot className="w-12 h-12 text-gray-300" />
            <p className="text-gray-400 text-sm">暂无匹配的日志记录</p>
          </div>
        ) : null}
      </div>

      {selectedLog ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI 日志详情</h3>
                  <p className="text-xs text-gray-400">{formatDateTimeLabel(selectedLog.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">意图</p>
                  <p className="text-sm font-medium">{getIntentLabel(selectedLog.intent)}</p>
                  <code className="text-xs text-gray-500">{selectedLog.intent}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">用户</p>
                  <p className="text-sm font-medium">{selectedLog.username || selectedLog.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">草稿类型</p>
                  <p className="text-sm">{selectedLog.draftType ?? "无"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">来源</p>
                  <p className="text-sm">{selectedLog.sources.join("、") || "无"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">用户输入</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedLog.message}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">AI 回复</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedLog.answerText}</p>
                </div>
              </div>

              {selectedLog.draftPayload ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">草稿 JSON</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(selectedLog.draftPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-xs text-gray-400 mb-2">风险提示</p>
                <div className="bg-accent/5 rounded-lg p-4 text-sm text-accent">
                  {selectedLog.riskNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
