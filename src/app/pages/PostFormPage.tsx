import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Shield, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

export function PostFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tag: "",
  });

  const tags = [
    { value: "experience", label: "经验分享" },
    { value: "tools", label: "工具分享" },
    { value: "question", label: "护理疑问" },
    { value: "discussion", label: "交流讨论" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("帖子已提交审核");
    setTimeout(() => navigate("/community"), 600);
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
            发布帖子
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">发帖须知</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ 可以发布：护理经验、技巧分享、工具表格</p>
                <p>✗ 禁止发布：疾病诊断、药品推荐、广告内容</p>
                <p className="text-accent mt-2">所有帖子需经审核后发布</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                帖子类型 <span className="text-destructive">*</span>
              </label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                required
              >
                <option value="">请选择类型</option>
                {tags.map((tag) => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                标题 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                placeholder="简明扼要地描述您要分享的内容"
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.title.length}/50
              </p>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="详细描述您的护理经验、技巧或想法...&#10;&#10;建议包含：&#10;1. 具体场景或问题&#10;2. 解决方法或经验&#10;3. 注意事项"
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.content.length}/2000
              </p>
            </div>
          </div>

          <div className="bg-chart-2/10 border border-chart-2/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">
                您的帖子将在审核通过后发布，审核时间通常为1-24小时。感谢您的理解与配合！
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
            <span>提交审核</span>
          </button>
        </form>
      </div>
    </div>
  );
}