import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { Lock, Shield, User } from "lucide-react";
import { useAdminAuthState } from "@/features/admin/state/useAdminAuthState";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { email, password, isSubmitting, error, setEmail, setPassword, login } = useAdminAuthState();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    const ok = await login();
    if (ok) {
      navigate("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
            医疗照顾者系统
          </h1>
          <p className="text-muted-foreground">后台管理登录</p>
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">管理员邮箱</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              后台账号独立于前台用户账号。Seed 管理员为 admin@example.com / admin123。
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          返回用户端
        </button>
      </div>
    </div>
  );
}
