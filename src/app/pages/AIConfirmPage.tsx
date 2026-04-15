import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Save, Sparkles, CheckCircle2, Edit2, AlertTriangle } from "lucide-react";
import { toast, Toaster } from "sonner";

export function AIConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "record";

  const [recordData, setRecordData] = useState({
    patient: "张明",
    recordType: "blood_pressure",
    systolic: "130",
    diastolic: "85",
    time: "2026-04-14T09:15",
    notes: "患者状态良好，测量前静息5分钟，双臂无明显差异。",
  });

  const [taskData, setTaskData] = useState({
    patient: "张明",
    title: "每日测量血压",
    description: "每天早上8点测量血压，记录收缩压和舒张压数值",
    time: "2026-04-15T08:00",
    cycle: "daily",
    priority: "normal",
  });

  const [formData, setFormData] = useState({
    name: "王强",
    age: "70",
    gender: "male",
    condition: "糖尿病",
    phone: "138-9876-5432",
    emergencyContact: "王丽（女儿）",
    emergencyPhone: "139-1234-5678",
    notes: "患者确诊糖尿病5年，服用二甲双胍，需定期监测血糖。",
  });

  const handleConfirm = () => {
    if (type === "record") {
      toast.success("护理记录已确认保存");
      setTimeout(() => navigate("/records"), 600);
    } else if (type === "task") {
      toast.success("护理任务已确认保存");
      setTimeout(() => navigate("/tasks"), 600);
    } else {
      toast.success("患者信息已确认保存");
      setTimeout(() => navigate("/patients"), 600);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "record": return "确认护理记录";
      case "task": return "确认护理任务";
      default: return "确认患者信息";
    }
  };

  const getIntent = () => {
    switch (type) {
      case "record": return "AI 识别意图：护理记录 · 血压测量";
      case "task": return "AI 识别意图：护理任务 · 重复提醒";
      default: return "AI 识别意图：患者信息填写";
    }
  };

  const renderRecordForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">关联患者</label>
        <input
          type="text"
          value={recordData.patient}
          onChange={(e) => setRecordData({ ...recordData, patient: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">记录类型</label>
        <select
          value={recordData.recordType}
          onChange={(e) => setRecordData({ ...recordData, recordType: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        >
          <option value="blood_pressure">血压测量</option>
          <option value="temperature">体温测量</option>
          <option value="blood_sugar">血糖测量</option>
          <option value="heart_rate">心率监测</option>
          <option value="medication">用药记录</option>
        </select>
      </div>
      {recordData.recordType === "blood_pressure" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">收缩压（mmHg）</label>
            <input
              type="number"
              value={recordData.systolic}
              onChange={(e) => setRecordData({ ...recordData, systolic: e.target.value })}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">舒张压（mmHg）</label>
            <input
              type="number"
              value={recordData.diastolic}
              onChange={(e) => setRecordData({ ...recordData, diastolic: e.target.value })}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 px-4 py-3 bg-primary/5 rounded-xl border border-primary/20 text-center">
            <p className="text-primary font-medium">{recordData.systolic}/{recordData.diastolic} mmHg</p>
            <p className="text-xs text-muted-foreground mt-0.5">血压预览</p>
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">记录时间</label>
        <input
          type="datetime-local"
          value={recordData.time}
          onChange={(e) => setRecordData({ ...recordData, time: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">备注说明</label>
        <textarea
          value={recordData.notes}
          onChange={(e) => setRecordData({ ...recordData, notes: e.target.value })}
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
        <input
          type="text"
          value={taskData.patient}
          onChange={(e) => setTaskData({ ...taskData, patient: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">任务标题</label>
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">任务描述</label>
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">提醒时间</label>
        <input
          type="datetime-local"
          value={taskData.time}
          onChange={(e) => setTaskData({ ...taskData, time: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">周期规则</label>
        <select
          value={taskData.cycle}
          onChange={(e) => setTaskData({ ...taskData, cycle: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        >
          <option value="once">仅一次</option>
          <option value="daily">每天</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">优先级</label>
        <div className="grid grid-cols-3 gap-2">
          {["low", "normal", "high"].map((p) => {
            const labels: Record<string, string> = { low: "普通", normal: "重要", high: "紧急" };
            return (
              <button
                key={p}
                type="button"
                onClick={() => setTaskData({ ...taskData, priority: p })}
                className={`py-2.5 rounded-xl border text-sm transition-colors ${
                  taskData.priority === p
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/60"
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPatientForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">患者姓名</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">年龄</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">性别</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">主要病情</label>
        <input
          type="text"
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">联系电话</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">紧急联系人</label>
        <input
          type="text"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">紧急联系电话</label>
        <input
          type="tel"
          value={formData.emergencyPhone}
          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">护理说明</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            {getTitle()}
          </h1>
          <div className="w-10" />
        </div>

        {/* Intent Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-white/70 mb-0.5">{getIntent()}</p>
            <p className="text-sm text-white/90">AI 已预填写以下信息，请核对后确认保存</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 pb-10">
        {/* AI Pre-fill Notice */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <Edit2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-0.5">AI 预填写说明</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              以下字段已根据您的输入自动识别填写。请仔细核对所有信息，如有偏差请在下方直接修改，然后点击确认保存。
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          {type === "record" && renderRecordForm()}
          {type === "task" && renderTaskForm()}
          {type !== "record" && type !== "task" && renderPatientForm()}
        </div>

        {/* Risk Notice */}
        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-2xl p-4">
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            确认保存后，数据将记录至系统。AI 信息仅供参考，医疗相关决策请遵循专业医生指导。
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="py-4 bg-muted/50 text-foreground rounded-2xl hover:bg-muted transition-colors text-sm"
          >
            返回修改
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认保存
          </button>
        </div>
      </div>
    </div>
  );
}