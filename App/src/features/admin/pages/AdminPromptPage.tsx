import { useEffect, useState } from "react";
import { RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { AdminPromptTemplate, AdminPromptTemplateDraft } from "@/features/admin/model";
import { adminPromptStatusLabels } from "@/features/admin/model";
import { listAdminPrompts, updateAdminPrompt } from "@/features/admin/services/admin.service";
import { formatDateTimeLabel } from "@/shared/lib/date";

function toDraft(prompt: AdminPromptTemplate): AdminPromptTemplateDraft {
  return {
    name: prompt.name,
    description: prompt.description,
    content: prompt.content,
    status: prompt.status,
  };
}

export function AdminPromptPage() {
  const [prompts, setPrompts] = useState<AdminPromptTemplate[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<AdminPromptTemplateDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPrompt = prompts.find((prompt) => prompt.id === selectedId) ?? null;

  async function loadPrompts() {
    setIsLoading(true);
    setError(null);

    try {
      const nextPrompts = await listAdminPrompts();
      setPrompts(nextPrompts);
      const nextSelected = nextPrompts.find((prompt) => prompt.id === selectedId) ?? nextPrompts[0] ?? null;
      setSelectedId(nextSelected?.id ?? "");
      setDraft(nextSelected ? toDraft(nextSelected) : null);
    } catch {
      setError("Prompt 模板加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPrompts();
  }, []);

  function selectPrompt(prompt: AdminPromptTemplate) {
    setSelectedId(prompt.id);
    setDraft(toDraft(prompt));
  }

  function updateDraft<Key extends keyof AdminPromptTemplateDraft>(
    key: Key,
    value: AdminPromptTemplateDraft[Key],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleSave() {
    if (!selectedPrompt || !draft) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateAdminPrompt(selectedPrompt.id, draft);
      setPrompts((current) => current.map((prompt) => (prompt.id === updated.id ? updated : prompt)));
      setDraft(toDraft(updated));
      toast.success("Prompt 模板已保存");
    } catch {
      toast.error("Prompt 模板保存失败");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Prompt 模板管理</h1>
        </div>
        <button
          onClick={() => void loadPrompts()}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={() => void loadPrompts()} className="ml-3 underline">
            重新加载
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="mb-3 px-2 text-xs uppercase tracking-wide text-gray-400">模板列表</p>
          {isLoading ? <div className="px-2 py-10 text-sm text-gray-400">正在加载...</div> : null}
          {!isLoading && prompts.length === 0 ? (
            <div className="px-2 py-10 text-sm text-gray-400">暂无 Prompt 模板</div>
          ) : null}
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => selectPrompt(prompt)}
                className={`w-full rounded-xl p-3 text-left transition-colors ${
                  selectedId === prompt.id ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">{prompt.name}</span>
                </div>
                <p className={`mt-1 text-xs ${selectedId === prompt.id ? "text-white/75" : "text-gray-400"}`}>
                  {adminPromptStatusLabels[prompt.status]} · {prompt.key}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          {selectedPrompt && draft ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg text-gray-900">{selectedPrompt.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    最近更新：{formatDateTimeLabel(selectedPrompt.updatedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    draft.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {adminPromptStatusLabels[draft.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm text-gray-600">
                  名称
                  <input
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  状态
                  <select
                    value={draft.status}
                    onChange={(event) => updateDraft("status", event.target.value as AdminPromptTemplateDraft["status"])}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary"
                  >
                    <option value="active">启用</option>
                    <option value="disabled">停用</option>
                  </select>
                </label>
                <label className="col-span-2 text-sm text-gray-600">
                  说明
                  <input
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-colors focus:border-primary"
                  />
                </label>
                <label className="col-span-2 text-sm text-gray-600">
                  Prompt 内容
                  <textarea
                    value={draft.content}
                    onChange={(event) => updateDraft("content", event.target.value)}
                    rows={18}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm leading-6 outline-none transition-colors focus:border-primary"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-gray-600">
                保存后会立即影响后端真实 DeepSeek 调用；本地未配置 DeepSeek key 或模型调用失败时，系统仍会走规则 fallback。
              </div>

              <button
                onClick={() => void handleSave()}
                disabled={isSaving || !draft.name.trim() || draft.content.trim().length < 20}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "保存中..." : "保存 Prompt"}
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-gray-400">请选择 Prompt 模板</div>
          )}
        </div>
      </div>
    </div>
  );
}
