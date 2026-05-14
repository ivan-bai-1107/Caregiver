import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, ArrowLeft, Send, Shield } from "lucide-react";
import { Toaster, toast } from "sonner";
import { communityTagOptions } from "@/features/community/model";
import { usePostFormState } from "@/features/community/state/usePostFormState";

export function PostFormPage() {
  const navigate = useNavigate();
  const { draft, isSubmitting, error, updateField, submit } = usePostFormState();
  const tags = communityTagOptions.filter((tag) => tag.value);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const post = await submit();
    if (post) {
      toast.success("帖子已提交审核");
      window.setTimeout(() => navigate(`/community/${post.id}`), 500);
    }
  }

  return (
    <div className="mobile-fixed-page bg-background">
      <Toaster position="top-center" richColors />
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            发布帖子
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="mobile-fixed-page-body px-6 py-6">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">发帖须知</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>可以发布：护理经验、技巧分享、工具表格。</p>
                <p>禁止发布：疾病诊断、药品推荐、广告内容。</p>
                <p className="text-accent mt-2">所有帖子需经审核后发布。</p>
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
                value={draft.tag}
                onChange={(event) => updateField("tag", event.target.value)}
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
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                placeholder="简明扼要地描述您要分享的内容"
                maxLength={80}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">{draft.title.length}/80</p>
            </div>

            <div>
              <label className="block text-sm text-foreground/80 mb-2">
                内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                name="content"
                value={draft.content}
                onChange={(event) => updateField("content", event.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder={"详细描述您的护理经验、技巧或想法...\n\n建议包含：\n1. 具体场景或问题\n2. 解决方法或经验\n3. 注意事项"}
                maxLength={3000}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">{draft.content.length}/3000</p>
            </div>
          </div>

          {error ? (
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 text-sm text-accent">
              {error}
            </div>
          ) : null}

          <div className="bg-chart-2/10 border border-chart-2/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">
                您的帖子会写入数据库并进入待审核队列，审核通过后才会对其他用户展示。
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? "提交中..." : "提交审核"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
