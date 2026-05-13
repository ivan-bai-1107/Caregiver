import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Edit2, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { PatientOption } from "@/entities/patient/mapper";
import {
  createEmptyRecordDraft,
  emptyCareMetricDraft,
  validateRecordDraft,
  type CareMetricDraft,
  type CareRecordDraft,
  type RecordType,
} from "@/entities/care-record/model";
import {
  createEmptyCareTaskDraft,
  validateCareTaskDraft,
  type CareTaskDraft,
  type CareTaskPriority,
  type CareTaskRepeatRule,
  type CareTaskType,
} from "@/entities/care-task/model";
import { getPatientOptions } from "@/features/patients/services/patient.service";
import { submitRecordDraft } from "@/features/records/services/record.service";
import { createCareTask } from "@/features/tasks/services/task.service";
import {
  clearStoredAIDraft,
  readStoredAIDraft,
  type StoredAIDraft,
} from "@/features/ai/services/assistant.service";
import { formatDateTimeLocalValue } from "@/shared/lib/date";

const recordTypes: Array<{ value: RecordType; label: string }> = [
  { value: "blood_pressure", label: "血压测量" },
  { value: "temperature", label: "体温测量" },
  { value: "blood_sugar", label: "血糖测量" },
  { value: "heart_rate", label: "心率监测" },
  { value: "medication", label: "用药记录" },
  { value: "diet", label: "饮食记录" },
  { value: "other", label: "状态观察" },
];

const taskTypes: Array<{ value: CareTaskType; label: string }> = [
  { value: "blood_pressure", label: "测量血压" },
  { value: "blood_sugar", label: "测量血糖" },
  { value: "medication", label: "按时用药" },
  { value: "diet", label: "饮食观察" },
  { value: "rehab", label: "康复训练" },
  { value: "appointment", label: "复诊预约" },
  { value: "nutrition", label: "营养评估" },
  { value: "other", label: "其他任务" },
];

const repeatRules: Array<{ value: CareTaskRepeatRule; label: string }> = [
  { value: "once", label: "仅一次" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
];

const priorities: Array<{ value: CareTaskPriority; label: string }> = [
  { value: "low", label: "普通" },
  { value: "normal", label: "重要" },
  { value: "high", label: "紧急" },
];

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : value === undefined || value === null ? fallback : String(value);
}

function toDateTimeLocal(value: unknown) {
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDateTimeLocalValue(parsed);
    }
  }
  return formatDateTimeLocalValue(new Date());
}

function toRecordType(value: unknown): RecordType | "" {
  return recordTypes.some((item) => item.value === value) ? (value as RecordType) : "";
}

function toTaskType(value: unknown): CareTaskType | "" {
  return taskTypes.some((item) => item.value === value) ? (value as CareTaskType) : "";
}

function toRepeatRule(value: unknown): CareTaskRepeatRule {
  return repeatRules.some((item) => item.value === value) ? (value as CareTaskRepeatRule) : "once";
}

function toPriority(value: unknown): CareTaskPriority {
  return priorities.some((item) => item.value === value) ? (value as CareTaskPriority) : "normal";
}

function buildRecordDraft(storedDraft: StoredAIDraft | null): CareRecordDraft {
  if (!storedDraft || storedDraft.draftType !== "record") {
    return createEmptyRecordDraft();
  }

  const payload = storedDraft.draftPayload;
  const metrics = (payload.metrics ?? {}) as Partial<CareMetricDraft>;
  return createEmptyRecordDraft({
    patientId: asString(payload.patientId),
    recordType: toRecordType(payload.recordType),
    occurredAt: toDateTimeLocal(payload.occurredAt),
    notes: asString(payload.notes, "AI 生成的护理记录草稿"),
    metrics: {
      ...emptyCareMetricDraft,
      ...metrics,
    },
  });
}

function buildTaskDraft(storedDraft: StoredAIDraft | null): CareTaskDraft {
  if (!storedDraft || storedDraft.draftType !== "task") {
    return createEmptyCareTaskDraft();
  }

  const payload = storedDraft.draftPayload;
  return createEmptyCareTaskDraft({
    patientId: asString(payload.patientId),
    title: asString(payload.title),
    description: asString(payload.description),
    taskType: toTaskType(payload.taskType),
    remindTime: toDateTimeLocal(payload.remindTime),
    repeatRule: toRepeatRule(payload.repeatRule),
    priority: toPriority(payload.priority),
    remindOffsetMinutes: Number(payload.remindOffsetMinutes ?? 15),
    status: "pending",
  });
}

export function AIConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [storedDraft] = useState(() => readStoredAIDraft());
  const [availablePatients, setAvailablePatients] = useState<PatientOption[]>([]);
  const [recordDraft, setRecordDraft] = useState<CareRecordDraft>(() => buildRecordDraft(storedDraft));
  const [taskDraft, setTaskDraft] = useState<CareTaskDraft>(() => buildTaskDraft(storedDraft));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const draftType = storedDraft?.draftType ?? searchParams.get("type");

  useEffect(() => {
    async function loadPatients() {
      try {
        setAvailablePatients(await getPatientOptions());
      } catch {
        toast.error("患者列表加载失败，请返回后重试");
      }
    }

    void loadPatients();
  }, []);

  const pageTitle = useMemo(() => {
    if (draftType === "task") {
      return "确认护理任务";
    }
    return "确认护理记录";
  }, [draftType]);

  function updateRecordDraft<Key extends keyof CareRecordDraft>(key: Key, value: CareRecordDraft[Key]) {
    setRecordDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateRecordMetric<Key extends keyof CareMetricDraft>(key: Key, value: CareMetricDraft[Key]) {
    setRecordDraft((current) => ({
      ...current,
      metrics: {
        ...current.metrics,
        [key]: value,
      },
    }));
  }

  function updateTaskDraft<Key extends keyof CareTaskDraft>(key: Key, value: CareTaskDraft[Key]) {
    setTaskDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleConfirm() {
    if (!storedDraft) {
      toast.error("没有可确认的 AI 草稿");
      return;
    }

    setIsSubmitting(true);

    try {
      if (storedDraft.draftType === "record") {
        const validation = validateRecordDraft(recordDraft);
        if (!validation.isValid) {
          toast.error(validation.messages[0] ?? "请补全护理记录信息");
          return;
        }

        await submitRecordDraft(recordDraft, "ai");
        clearStoredAIDraft();
        toast.success("护理记录已保存");
        setTimeout(() => navigate("/records"), 500);
        return;
      }

      const validation = validateCareTaskDraft(taskDraft);
      if (!validation.isValid) {
        toast.error(validation.messages[0] ?? "请补全护理任务信息");
        return;
      }

      await createCareTask(taskDraft);
      clearStoredAIDraft();
      toast.success("护理任务已保存");
      setTimeout(() => navigate("/tasks"), 500);
    } catch {
      toast.error("保存失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderPatientSelect = (value: string, onChange: (value: string) => void) => (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
    >
      <option value="">请选择患者</option>
      {availablePatients.map((patient) => (
        <option key={patient.value} value={patient.value}>
          {patient.label}
        </option>
      ))}
    </select>
  );

  const renderRecordMetrics = () => {
    switch (recordDraft.recordType) {
      case "blood_pressure":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">收缩压（mmHg）</label>
              <input
                type="number"
                value={recordDraft.metrics.bloodPressureSystolic}
                onChange={(event) => updateRecordMetric("bloodPressureSystolic", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">舒张压（mmHg）</label>
              <input
                type="number"
                value={recordDraft.metrics.bloodPressureDiastolic}
                onChange={(event) => updateRecordMetric("bloodPressureDiastolic", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        );
      case "temperature":
        return (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">体温（°C）</label>
            <input
              type="number"
              step="0.1"
              value={recordDraft.metrics.temperature}
              onChange={(event) => updateRecordMetric("temperature", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        );
      case "blood_sugar":
        return (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">血糖（mmol/L）</label>
            <input
              type="number"
              step="0.1"
              value={recordDraft.metrics.bloodSugar}
              onChange={(event) => updateRecordMetric("bloodSugar", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        );
      case "heart_rate":
        return (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">心率（bpm）</label>
            <input
              type="number"
              value={recordDraft.metrics.heartRate}
              onChange={(event) => updateRecordMetric("heartRate", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        );
      case "medication":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">药品名称</label>
              <input
                value={recordDraft.metrics.medicationName}
                onChange={(event) => updateRecordMetric("medicationName", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">剂量</label>
              <input
                value={recordDraft.metrics.medicationDose}
                onChange={(event) => updateRecordMetric("medicationDose", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        );
      case "diet":
      case "other": {
        const key = recordDraft.recordType === "diet" ? "dietDescription" : "observationText";
        return (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">
              {recordDraft.recordType === "diet" ? "饮食内容" : "状态描述"}
            </label>
            <textarea
              value={recordDraft.metrics[key]}
              onChange={(event) => updateRecordMetric(key, event.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderRecordForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">关联患者</label>
        {renderPatientSelect(recordDraft.patientId, (value) => updateRecordDraft("patientId", value))}
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">记录类型</label>
        <select
          value={recordDraft.recordType}
          onChange={(event) => updateRecordDraft("recordType", toRecordType(event.target.value))}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        >
          <option value="">请选择记录类型</option>
          {recordTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      {renderRecordMetrics()}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">记录时间</label>
        <input
          type="datetime-local"
          value={recordDraft.occurredAt}
          onChange={(event) => updateRecordDraft("occurredAt", event.target.value)}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">备注说明</label>
        <textarea
          value={recordDraft.notes}
          onChange={(event) => updateRecordDraft("notes", event.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>
  );

  const renderTaskForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">关联患者</label>
        {renderPatientSelect(taskDraft.patientId, (value) => updateTaskDraft("patientId", value))}
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">任务标题</label>
        <input
          value={taskDraft.title}
          onChange={(event) => updateTaskDraft("title", event.target.value)}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">任务描述</label>
        <textarea
          value={taskDraft.description}
          onChange={(event) => updateTaskDraft("description", event.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">任务类型</label>
        <select
          value={taskDraft.taskType}
          onChange={(event) => updateTaskDraft("taskType", toTaskType(event.target.value))}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        >
          <option value="">请选择任务类型</option>
          {taskTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">提醒时间</label>
        <input
          type="datetime-local"
          value={taskDraft.remindTime}
          onChange={(event) => updateTaskDraft("remindTime", event.target.value)}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">周期规则</label>
          <select
            value={taskDraft.repeatRule}
            onChange={(event) => updateTaskDraft("repeatRule", toRepeatRule(event.target.value))}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          >
            {repeatRules.map((rule) => (
              <option key={rule.value} value={rule.value}>
                {rule.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">优先级</label>
          <select
            value={taskDraft.priority}
            onChange={(event) => updateTaskDraft("priority", toPriority(event.target.value))}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  if (!storedDraft) {
    return (
      <div className="min-h-screen bg-background px-6 py-12">
        <Toaster position="top-center" richColors />
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-6">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-medium mb-2">没有可确认的 AI 草稿</p>
          <p className="text-sm text-muted-foreground mb-4">请先从 AI 护理助手生成护理记录或护理任务草稿。</p>
          <button
            onClick={() => navigate("/ai-assistant")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm"
          >
            返回 AI 助手
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            {pageTitle}
          </h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-white/70 mb-0.5">
              {storedDraft.draftType === "record" ? "AI 识别意图：护理记录" : "AI 识别意图：护理任务"}
            </p>
            <p className="text-sm text-white/90">AI 已预填写以下信息，请核对后确认保存</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 pb-10">
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <Edit2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-0.5">AI 预填写说明</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              请核对患者、时间、指标和备注信息。确认后才会写入真实护理数据。
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          {storedDraft.draftType === "record" ? renderRecordForm() : renderTaskForm()}
        </div>

        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-2xl p-4">
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">{storedDraft.riskNote}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="py-4 bg-muted/50 text-foreground rounded-2xl hover:bg-muted transition-colors text-sm"
          >
            返回修改
          </button>
          <button
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md text-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? "保存中..." : "确认保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
