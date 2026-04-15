import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";

type RecordTypeValue =
  | "blood_pressure"
  | "temperature"
  | "blood_sugar"
  | "heart_rate"
  | "medication"
  | "diet"
  | "other";

const recordTypes = [
  { value: "blood_pressure" as RecordTypeValue, label: "血压测量", category: "生命体征" },
  { value: "temperature" as RecordTypeValue, label: "体温测量", category: "生命体征" },
  { value: "blood_sugar" as RecordTypeValue, label: "血糖测量", category: "生命体征" },
  { value: "heart_rate" as RecordTypeValue, label: "心率监测", category: "生命体征" },
  { value: "medication" as RecordTypeValue, label: "用药记录", category: "用药记录" },
  { value: "diet" as RecordTypeValue, label: "饮食记录", category: "饮食记录" },
  { value: "other" as RecordTypeValue, label: "状态观察", category: "状态观察" },
];

const patients = [
  { id: 1, name: "张明", age: 68 },
  { id: 2, name: "李华", age: 72 },
  { id: 3, name: "王芳", age: 65 },
];

export function RecordFormPage() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState("");
  const [type, setType] = useState<RecordTypeValue | "">("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  // Dynamic metrics per type
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [sugarValue, setSugarValue] = useState("");
  const [heartRateValue, setHeartRateValue] = useState("");
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [dietDesc, setDietDesc] = useState("");
  const [stateDesc, setStateDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("护理记录已保存");
    setTimeout(() => navigate("/records"), 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            新增护理记录
          </h1>
          <button
            onClick={() => navigate("/ai-assistant")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl text-sm"
          >
            <Sparkles className="w-4 h-4" />
            AI助手
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 pb-10">
        {/* Patient Select */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">基本信息</h2>
          <div>
            <label className="block text-sm mb-2">
              选择患者 <span className="text-destructive">*</span>
            </label>
            <select
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              required
            >
              <option value="">请选择患者</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（{p.age}岁）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">
              记录时间 <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Record Type */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">记录类型</h2>
          <div className="grid grid-cols-2 gap-2">
            {recordTypes.map((rt) => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setType(rt.value)}
                className={`px-4 py-3 rounded-xl border text-left transition-colors ${
                  type === rt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/70 hover:bg-muted/50"
                }`}
              >
                <p className="text-sm font-medium">{rt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rt.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Inputs */}
        {type && (
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <h2 className="text-sm text-muted-foreground uppercase tracking-wide">指标录入</h2>

            {type === "blood_pressure" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2">
                    收缩压 <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="如：130"
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors pr-14"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      mmHg
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    舒张压 <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="如：85"
                      className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors pr-14"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      mmHg
                    </span>
                  </div>
                </div>
                {systolic && diastolic && (
                  <div className="col-span-2 px-4 py-3 bg-primary/5 rounded-xl border border-primary/20 text-center">
                    <p className="text-primary font-medium">{systolic}/{diastolic} mmHg</p>
                    <p className="text-xs text-muted-foreground mt-0.5">血压读数预览</p>
                  </div>
                )}
              </div>
            )}

            {type === "temperature" && (
              <div>
                <label className="block text-sm mb-2">
                  体温 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="如：36.5"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors pr-10"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    °C
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">正常范围：36.0 – 37.2°C</p>
              </div>
            )}

            {type === "blood_sugar" && (
              <div>
                <label className="block text-sm mb-2">
                  血糖值 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={sugarValue}
                    onChange={(e) => setSugarValue(e.target.value)}
                    placeholder="如：6.2"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors pr-20"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    mmol/L
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">空腹正常范围：3.9 – 6.1 mmol/L</p>
              </div>
            )}

            {type === "heart_rate" && (
              <div>
                <label className="block text-sm mb-2">
                  心率 <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={heartRateValue}
                    onChange={(e) => setHeartRateValue(e.target.value)}
                    placeholder="如：72"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors pr-12"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    bpm
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">正常静息心率：60 – 100 bpm</p>
              </div>
            )}

            {type === "medication" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2">
                    药品名称 <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="如：硝苯地平缓释片"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">用药剂量</label>
                  <input
                    type="text"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    placeholder="如：1片 / 5mg"
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {type === "diet" && (
              <div>
                <label className="block text-sm mb-2">
                  饮食内容 <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={dietDesc}
                  onChange={(e) => setDietDesc(e.target.value)}
                  rows={3}
                  placeholder="描述本次饮食内容，包括食物种类、大致分量等..."
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
            )}

            {type === "other" && (
              <div>
                <label className="block text-sm mb-2">
                  状态描述 <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={stateDesc}
                  onChange={(e) => setStateDesc(e.target.value)}
                  rows={4}
                  placeholder="描述患者的状态、行为或观察到的变化..."
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <label className="block text-sm mb-2">备注说明（可选）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="记录其他观察到的情况，如患者当时的状态、异常表现等..."
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <p className="text-sm text-foreground/75 leading-relaxed">
            <span className="font-medium text-primary">提示：</span>
            准确填写护理数据有助于 AI 分析健康趋势。如需快速录入，可使用 AI 助手通过自然语言描述自动生成记录。
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>保存记录</span>
        </button>
      </form>
    </div>
  );
}