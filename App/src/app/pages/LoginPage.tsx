import { useNavigate } from "react-router";
import { Heart, Mail, Lock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useLoginFormState } from "@/features/auth/state/useLoginFormState";

export function LoginPage() {
  const navigate = useNavigate();
  const { draft, fieldErrors, submitError, isSubmitting, updateDraft, submit } = useLoginFormState();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await submit();

    if (!result.ok) {
      toast.error(result.reason === "validation" ? "请先完善登录信息" : "登录失败，请稍后重试。");
      return;
    }

    toast.success("登录成功");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            医疗照顾者
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            帮助记录护理信息、追踪健康变化、获取护理支持
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-foreground/80">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => updateDraft("email", event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
              {fieldErrors.email ? (
                <p className="mt-2 text-xs text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={draft.password}
                  onChange={(event) => updateDraft("password", event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                />
              </div>
              {fieldErrors.password ? (
                <p className="mt-2 text-xs text-destructive">{fieldErrors.password}</p>
              ) : null}
            </div>

            {submitError ? (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
                {submitError}
              </div>
            ) : null}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-muted-foreground">记住我</span>
              </label>
              <button type="button" className="text-primary">
                忘记密码?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
            >
              {isSubmitting ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">还没有账号? </span>
            <button onClick={() => navigate("/register")} className="text-primary text-sm">
              立即注册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
