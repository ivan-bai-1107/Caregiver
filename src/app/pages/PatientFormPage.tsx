import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Phone, UserPlus, AlertTriangle } from "lucide-react";
import { toast, Toaster } from "sonner";

export function PatientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: isEdit ? "张明" : "",
    age: isEdit ? "68" : "",
    gender: isEdit ? "male" : "",
    condition: isEdit ? "高血压、冠心病" : "",
    allergy: isEdit ? "青霉素过敏" : "",
    phone: isEdit ? "138-1234-5678" : "",
    emergencyContact: isEdit ? "张丽（女儿）" : "",
    emergencyPhone: isEdit ? "139-5678-1234" : "",
    profileNote: isEdit ? "患者有高血压病史10年，目前服用降压药，需定期监测血压。同时患有轻度冠心病，需注意心率异常。" : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "患者信息已更新" : "患者添加成功");
    setTimeout(() => navigate(isEdit ? `/patients/${id}` : "/care"), 600);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            {isEdit ? "编辑患者" : "添加患者"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="font-medium mb-2">基本信息</h2>

          <div>
            <label className="block text-sm text-foreground/80 mb-2">
              姓名 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="请输入患者姓名"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                年龄 <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                placeholder="年龄"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                性别 <span className="text-destructive">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                required
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground/80 mb-2">
              主要病情 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="如：高血压、糖尿病"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              过敏史
            </label>
            <input
              type="text"
              name="allergy"
              value={formData.allergy}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="如：青霉素过敏（无则留空）"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="flex items-center gap-2 font-medium mb-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            联系信息
          </h2>
          <div>
            <label className="block text-sm text-foreground/80 mb-2">联系电话</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="患者或主要家属电话"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
              紧急联系人
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="如：张丽（女儿）"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground/80 mb-2">紧急联系电话</label>
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="紧急联系人电话"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <h2 className="font-medium mb-2">护理说明</h2>
          <textarea
            name="profileNote"
            value={formData.profileNote}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="记录患者的主要病情、护理注意事项、用药信息等..."
          />
          <p className="text-xs text-muted-foreground">
            可记录患者的病情概述、过敏史、用药情况及其他护理注意事项。
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>{isEdit ? "保存修改" : "添加患者"}</span>
        </button>
      </form>
    </div>
  );
}