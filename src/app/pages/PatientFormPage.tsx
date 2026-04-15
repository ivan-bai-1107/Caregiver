import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { toast, Toaster } from "sonner";
import { usePatientFormState } from "@/features/patients/state/usePatientFormState";

export function PatientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isEdit, draft, fieldErrors, isLoading, loadError, isSubmitting, updateDraft, submit } =
    usePatientFormState(id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await submit();
      if (!result.ok) {
        toast.error("请先完善患者信息");
        return;
      }

      toast.success(isEdit ? "患者信息已更新" : "患者添加成功");
      setTimeout(() => navigate(`/patients/${result.patient.id}`), 600);
    } catch {
      toast.error("患者信息保存失败，请稍后重试。");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />

      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {isEdit ? "编辑患者" : "添加患者"}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="px-6 py-10">
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            患者表单加载中...
          </div>
        </div>
      ) : null}

      {!isLoading && loadError ? (
        <div className="px-6 py-10">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">患者表单初始化失败</p>
            <p className="mt-2 text-sm text-foreground/75">{loadError}</p>
          </div>
        </div>
      ) : null}

      {!isLoading && !loadError ? (
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <h2 className="font-medium mb-2">基本信息</h2>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                姓名 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                placeholder="请输入患者姓名"
                required
              />
              {fieldErrors.name ? <p className="mt-2 text-xs text-destructive">{fieldErrors.name}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-foreground/80 mb-2">
                  年龄 <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  value={draft.age}
                  onChange={(event) => updateDraft("age", event.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="年龄"
                  required
                />
                {fieldErrors.age ? <p className="mt-2 text-xs text-destructive">{fieldErrors.age}</p> : null}
              </div>
              <div>
                <label className="block text-sm text-foreground/80 mb-2">
                  性别 <span className="text-destructive">*</span>
                </label>
                <select
                  value={draft.gender}
                  onChange={(event) => updateDraft("gender", event.target.value as typeof draft.gender)}
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  required
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
                {fieldErrors.gender ? (
                  <p className="mt-2 text-xs text-destructive">{fieldErrors.gender}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <h2 className="flex items-center gap-2 font-medium mb-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              护理说明
            </h2>
            <textarea
              value={draft.profileNote}
              onChange={(event) => updateDraft("profileNote", event.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="记录患者的主要病情、护理注意事项、用药信息等..."
            />
            {fieldErrors.profileNote ? (
              <p className="text-xs text-destructive">{fieldErrors.profileNote}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              当前表单只提交 Patient 核心字段，病情与护理补充说明统一收口到 `profileNote`。
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? "保存中..." : isEdit ? "保存修改" : "添加患者"}</span>
          </button>
        </form>
      ) : null}
    </div>
  );
}
