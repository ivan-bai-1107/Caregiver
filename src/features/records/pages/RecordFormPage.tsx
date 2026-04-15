import { useNavigate } from "react-router";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Toaster, toast } from "sonner";
import { appRoutes } from "../../../shared/constants/routes";
import { RecordDraftPreviewCard } from "../components/RecordDraftPreviewCard";
import { RecordMetricFieldsSection } from "../components/RecordMetricFieldsSection";
import { RecordValidationSummary } from "../components/RecordValidationSummary";
import { useRecordFormState } from "../state/useRecordFormState";

export function RecordFormPage() {
  const navigate = useNavigate();
  const {
    formState,
    hasTriedSubmit,
    updateDraft,
    updateMetric,
    selectRecordType,
    getFieldError,
    submit,
  } = useRecordFormState();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await submit();

    if (!result.ok) {
      toast.error("请先完善记录草稿");
      return;
    }

    toast.success("护理记录已保存");
    setTimeout(() => navigate(appRoutes.records), 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            新增护理记录
          </h1>
          <button
            onClick={() => navigate(appRoutes.aiAssistant)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl text-sm"
          >
            <Sparkles className="w-4 h-4" />
            AI助手
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 pb-10">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">基本信息</h2>

          <div>
            <label className="block text-sm mb-2">
              选择患者 <span className="text-destructive">*</span>
            </label>
            <select
              value={formState.draft.patientId}
              onChange={(event) => updateDraft("patientId", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">请选择患者</option>
              {formState.availablePatients.map((patient) => (
                <option key={patient.value} value={patient.value}>
                  {patient.label}
                </option>
              ))}
            </select>
            {getFieldError("patientId") ? (
              <p className="text-xs text-destructive mt-2">{getFieldError("patientId")}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm mb-2">
              记录时间 <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              value={formState.draft.occurredAt}
              onChange={(event) => updateDraft("occurredAt", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
            {getFieldError("occurredAt") ? (
              <p className="text-xs text-destructive mt-2">{getFieldError("occurredAt")}</p>
            ) : null}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">记录类型</h2>
          <div className="grid grid-cols-2 gap-2">
            {formState.recordTypes.map((recordType) => (
              <button
                key={recordType.value}
                type="button"
                onClick={() => selectRecordType(recordType.value)}
                className={`px-4 py-3 rounded-xl border text-left transition-colors ${
                  formState.draft.recordType === recordType.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <p className="text-sm font-medium">{recordType.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{recordType.category}</p>
              </button>
            ))}
          </div>
          {getFieldError("recordType") ? (
            <p className="text-xs text-destructive">{getFieldError("recordType")}</p>
          ) : null}
        </div>

        {formState.draft.recordType ? (
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wide">指标录入</h2>
            <RecordMetricFieldsSection
              fields={formState.metricFields}
              metrics={formState.draft.metrics}
              getError={(key) => getFieldError(`metrics.${key}`)}
              onChange={updateMetric}
            />
          </div>
        ) : null}

        <div className="bg-card rounded-2xl p-5 border border-border">
          <label className="block text-sm mb-2">备注说明（可选）</label>
          <textarea
            value={formState.draft.notes}
            onChange={(event) => updateDraft("notes", event.target.value)}
            rows={3}
            placeholder="记录其他观察到的情况，如患者当时的状态、异常表现等..."
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <RecordDraftPreviewCard preview={formState.preview} />

        {hasTriedSubmit ? (
          <RecordValidationSummary messages={formState.validation.messages} />
        ) : null}

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm text-foreground/75 leading-relaxed">
            <span className="font-medium text-primary">提示：</span>
            当前页面已改为正式草稿模型驱动。护理记录仍保持 care_record + care_metric 双层方向，
            血压继续使用收缩压和舒张压双字段录入，不会退回普通文本表单。
          </p>
        </div>

        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          <span>{formState.isSubmitting ? "保存中..." : "保存记录"}</span>
        </button>
      </form>
    </div>
  );
}
