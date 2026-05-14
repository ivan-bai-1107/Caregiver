import { useNavigate } from "react-router";
import { ArrowLeft, Heart, Lock, Mail, Send } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useForgotPasswordState } from "@/features/auth/state/useForgotPasswordState";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    draft,
    fieldErrors,
    formError,
    isSendingCode,
    isSubmitting,
    countdown,
    updateDraft,
    requestCode,
    submit,
  } = useForgotPasswordState();

  async function handleSendCode() {
    const result = await requestCode();
    if (!result.ok) {
      toast.error(result.message ?? "验证码发送失败，请稍后重试。");
      return;
    }
    toast.success("验证码已发送");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await submit();

    if (!result.ok) {
      toast.error(
        result.reason === "validation" ? "请先完善重置信息" : result.message ?? "密码重置失败，请稍后重试。",
      );
      return;
    }

    toast.success("密码已重置，请使用新密码登录");
    setTimeout(() => navigate("/login"), 600);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            找回密码
          </h1>
          <p className="text-muted-foreground text-sm">通过邮箱验证码重置登录密码</p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-foreground/80">邮箱地址</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => updateDraft("email", event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入注册邮箱"
                  required
                />
              </div>
              {fieldErrors.email ? <p className="mt-2 text-xs text-destructive">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">验证码</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={draft.code}
                    onChange={(event) => updateDraft("code", event.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                    placeholder="请输入验证码"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode}
                  className="px-6 py-3.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}秒` : "发送"}
                </button>
              </div>
              {fieldErrors.code ? <p className="mt-2 text-xs text-destructive">{fieldErrors.code}</p> : null}
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">新密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={draft.password}
                  onChange={(event) => updateDraft("password", event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入新密码"
                  required
                />
              </div>
              {fieldErrors.password ? <p className="mt-2 text-xs text-destructive">{fieldErrors.password}</p> : null}
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">确认新密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={draft.confirmPassword}
                  onChange={(event) => updateDraft("confirmPassword", event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="mt-2 text-xs text-destructive">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>

            {formError ? (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md mt-6 disabled:opacity-70"
            >
              {isSubmitting ? "重置中..." : "重置密码"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
