import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Bell, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";

const patients = [
  { id: 1, name: "张明", age: 68 },
  { id: 2, name: "李华", age: 72 },
  { id: 3, name: "王芳", age: 65 },
];

const cycleOptions = [
  { value: "once", label: "仅一次", desc: "执行一次后自动结束" },
  { value: "daily", label: "每天", desc: "每天重复执行" },
  { value: "weekly", label: "每周", desc: "每周同一天重复" },
  { value: "monthly", label: "每月", desc: "每月同一日期重复" },
];

const taskTypes = [
  { value: "blood_pressure", label: "测量血压" },
  { value: "blood_sugar", label: "测量血糖" },
  { value: "medication", label: "按时用药" },
  { value: "diet", label: "饮食观察" },
  { value: "rehab", label: "康复训练" },
  { value: "other", label: "其他任务" },
];

export function TaskFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient: "",
    title: "",
    description: "",
    taskType: "",
    time: "",
    cycle: "once",
    priority: "normal",
    reminder: "15",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("护理任务已创建");
    setTimeout(() => navigate("/tasks"), 600);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
            创建护理任务
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
        {/* 基本信息 */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">任务基本信息</h2>

          <div>
            <label className="block text-sm mb-2">
              关联患者 <span className="text-destructive">*</span>
            </label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
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
            <label className="block text-sm mb-3">
              任务类型 <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {taskTypes.map((tt) => (
                <button
                  key={tt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, taskType: tt.value })}
                  className={`px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    formData.taskType === tt.value
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/30 border-border text-foreground/70 hover:bg-muted/50"
                  }`}
                >
                  {tt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">
              任务标题 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="如：测量血压、服药提醒、康复训练..."
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">任务描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="描述任务的详细内容、执行方式和注意事项..."
            />
          </div>
        </div>

        {/* 时间与周期 */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="text-sm text-muted-foreground uppercase tracking-wide">时间与周期</h2>

          <div>
            <label className="block text-sm mb-2">
              首次提醒时间 <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-3">周期规则</label>
            <div className="grid grid-cols-2 gap-2">
              {cycleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, cycle: option.value })}
                  className={`px-4 py-3 rounded-xl border text-left transition-colors ${
                    formData.cycle === option.value
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      formData.cycle === option.value ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-muted-foreground" />
              提前提醒
            </label>
            <select
              name="reminder"
              value={formData.reminder}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            >
              <option value="0">不提醒</option>
              <option value="15">提前15分钟</option>
              <option value="30">提前30分钟</option>
              <option value="60">提前1小时</option>
              <option value="1440">提前1天</option>
            </select>
          </div>
        </div>

        {/* 优先级 */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">优先级</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "low", label: "普通", color: "bg-muted/10 border-muted text-muted-foreground", activeColor: "bg-chart-2/10 border-chart-2 text-chart-2" },
              { value: "normal", label: "重要", color: "bg-muted/10 border-muted text-muted-foreground", activeColor: "bg-primary/10 border-primary text-primary" },
              { value: "high", label: "紧急", color: "bg-muted/10 border-muted text-muted-foreground", activeColor: "bg-accent/10 border-accent text-accent" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p.value })}
                className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                  formData.priority === p.value ? p.activeColor : p.color
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-chart-2/5 border border-chart-2/20 rounded-2xl p-4">
          <p className="text-sm text-foreground/75 leading-relaxed">
            <span className="font-medium text-chart-2">提示：</span>
            设置重复任务可以帮助建立规律的护理计划。也可通过 AI 助手，直接用自然语言描述任务需求快速创建。
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>创建任务</span>
        </button>
      </form>
    </div>
  );
}