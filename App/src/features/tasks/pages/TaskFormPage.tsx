import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Bell, Save, Sparkles } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  careTaskPriorityOptions,
  careTaskReminderOffsetOptions,
  careTaskRepeatRuleOptions,
  careTaskTypeOptions,
} from "@/entities/care-task/mapper";
import { appRoutes } from "@/shared/constants/routes";
import { TaskPrioritySelector } from "@/features/tasks/components/TaskPrioritySelector";
import { TaskTypeSelector } from "@/features/tasks/components/TaskTypeSelector";
import { TaskValidationSummary } from "@/features/tasks/components/TaskValidationSummary";
import { useTaskFormState } from "@/features/tasks/state/useTaskFormState";

export function TaskFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get("patient") ?? "";
  const { formState, updateDraft, retryBootstrap, submit } = useTaskFormState(initialPatientId);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const result = await submit();

      if (!result.ok) {
        toast.error("请先完善任务草稿");
        return;
      }

      toast.success("护理任务已创建");
      setTimeout(
        () => navigate(initialPatientId ? appRoutes.patientTasks(initialPatientId) : appRoutes.tasks),
        600,
      );
    } catch (submitError) {
      toast.error("任务创建失败，请稍后重试。");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      <div className="rounded-b-[2rem] bg-gradient-to-br from-primary to-primary/80 px-6 pb-6 pt-12 text-white">
        <div className="mb-2 flex items-center justify-between">
          <button className="-ml-2 p-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            创建护理任务
          </h1>
          <button
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm"
            onClick={() => navigate(appRoutes.aiAssistant)}
          >
            <Sparkles className="h-4 w-4" />
            AI助手
          </button>
        </div>
      </div>

      {formState.isLoading ? (
        <div className="px-6 py-10">
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            任务表单加载中...
          </div>
        </div>
      ) : null}

      {!formState.isLoading && formState.loadError ? (
        <div className="px-6 py-10">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">任务表单初始化失败</p>
            <p className="mt-2 text-sm text-foreground/75">{formState.loadError}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={() => void retryBootstrap()}
            >
              重新加载
            </button>
          </div>
        </div>
      ) : null}

      {!formState.isLoading && !formState.loadError ? (
        <form className="space-y-5 px-6 py-6 pb-10" onSubmit={handleSubmit}>
          {formState.availablePatients.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
              当前暂无可关联的患者，请先补充患者数据后再创建护理任务。
            </div>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm uppercase tracking-wide text-muted-foreground">
              任务基本信息
            </h2>

            <div>
              <label className="mb-2 block text-sm">
                关联患者 <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-transparent bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                onChange={(event) => updateDraft("patientId", event.target.value)}
                value={formState.draft.patientId}
              >
                <option value="">请选择患者</option>
                {formState.availablePatients.map((patient) => (
                  <option key={patient.value} value={patient.value}>
                    {patient.label}
                  </option>
                ))}
              </select>
              {formState.validationErrors.patientId ? (
                <p className="mt-2 text-xs text-destructive">
                  {formState.validationErrors.patientId}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-3 block text-sm">
                任务类型 <span className="text-destructive">*</span>
              </label>
              <TaskTypeSelector
                onChange={(value) => updateDraft("taskType", value)}
                options={careTaskTypeOptions}
                value={formState.draft.taskType}
              />
              {formState.validationErrors.taskType ? (
                <p className="mt-2 text-xs text-destructive">
                  {formState.validationErrors.taskType}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm">
                任务标题 <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-transparent bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="如：测量血压、服药提醒、康复训练..."
                type="text"
                value={formState.draft.title}
              />
              {formState.validationErrors.title ? (
                <p className="mt-2 text-xs text-destructive">
                  {formState.validationErrors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm">任务描述</label>
              <textarea
                className="w-full resize-none rounded-xl border border-transparent bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                onChange={(event) => updateDraft("description", event.target.value)}
                placeholder="描述任务的详细内容、执行方式和注意事项..."
                rows={3}
                value={formState.draft.description}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm uppercase tracking-wide text-muted-foreground">
              时间与周期
            </h2>

            <div>
              <label className="mb-2 block text-sm">
                首次提醒时间 <span className="text-destructive">*</span>
              </label>
              <input
                className="w-full rounded-xl border border-transparent bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                onChange={(event) => updateDraft("remindTime", event.target.value)}
                type="datetime-local"
                value={formState.draft.remindTime}
              />
              {formState.validationErrors.remindTime ? (
                <p className="mt-2 text-xs text-destructive">
                  {formState.validationErrors.remindTime}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-3 block text-sm">周期规则</label>
              <div className="grid grid-cols-2 gap-2">
                {careTaskRepeatRuleOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      formState.draft.repeatRule === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => updateDraft("repeatRule", option.value)}
                    type="button"
                  >
                    <p
                      className={`text-sm font-medium ${
                        formState.draft.repeatRule === option.value
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm">
                <Bell className="h-4 w-4 text-muted-foreground" />
                提前提醒
              </label>
              <select
                className="w-full rounded-xl border border-transparent bg-input-background px-4 py-3 transition-colors focus:border-primary focus:outline-none"
                onChange={(event) =>
                  updateDraft("remindOffsetMinutes", Number(event.target.value))
                }
                value={String(formState.draft.remindOffsetMinutes)}
              >
                {careTaskReminderOffsetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formState.validationErrors.remindOffsetMinutes ? (
                <p className="mt-2 text-xs text-destructive">
                  {formState.validationErrors.remindOffsetMinutes}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              优先级
            </h2>
            <TaskPrioritySelector
              onChange={(value) => updateDraft("priority", value)}
              options={careTaskPriorityOptions}
              value={formState.draft.priority}
            />
          </div>

          <TaskValidationSummary messages={formState.validationMessages} />

          <div className="rounded-2xl border border-chart-2/20 bg-chart-2/5 p-4">
            <p className="text-sm leading-relaxed text-foreground/75">
              <span className="font-medium text-chart-2">提示：</span>
              当前任务表单已经基于正式 `CareTaskDraft` 驱动，患者显示信息只停留在视图层，
              不会再回流污染核心 `CareTask` 实体。
            </p>
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-70"
            disabled={formState.isSubmitting || formState.availablePatients.length === 0}
            type="submit"
          >
            <Save className="h-5 w-5" />
            <span>{formState.isSubmitting ? "创建中..." : "创建任务"}</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}
