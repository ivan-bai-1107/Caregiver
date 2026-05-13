import { Sparkles } from "lucide-react";

export function AdminPromptPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Prompt 模板管理</h1>
        <p className="text-sm text-gray-500 mt-1">预留模块</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-lg text-gray-900 mb-3" style={{ fontFamily: "var(--font-display)" }}>
          当前 AI 使用后端内置安全 Prompt
        </h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed max-w-3xl">
          <p>
            当前 AI assistant 已由后端统一接入 DeepSeek provider，并保留规则 fallback。结构化 record/task 草稿会经过后端强校验，用户确认后才会保存。
          </p>
          <p>
            Prompt 模板管理暂不开放可编辑列表，避免出现“看起来能改但实际不生效”的假交互。后续如果需要做 Prompt 版本、灰度发布和审计，再单独扩展后台能力。
          </p>
        </div>
      </div>
    </div>
  );
}
