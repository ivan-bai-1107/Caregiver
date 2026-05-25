import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Lock, Mail, Shield } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAdminAuthState } from "@admin/state/useAdminAuthState";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { email, password, isSubmitting, error, setEmail, setPassword, login } = useAdminAuthState();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    const ok = await login();
    if (ok) {
      toast.success("后台登录成功");
      navigate("/admin/dashboard");
    } else {
      toast.error("管理员账号或密码错误。");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            医疗照顾者
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            后台管理控制台，用于内容、用户与 AI 服务管理
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-foreground/80">管理员邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
            >
              {isSubmitting ? "登录中..." : "登录"}
            </button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回用户端
          </button>
        </div>
      </div>
    </div>
  );
}
