import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, User, Mail, Lock, Send } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("两次密码输入不一致");
      return;
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
            <Heart className="w-10 h-10 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            创建账号
          </h1>
          <p className="text-muted-foreground text-sm">
            开始您的专业护理之旅
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-lg p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-foreground/80">
                用户名 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">
                邮箱地址 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">
                验证码 <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                    placeholder="请输入验证码"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-6 py-3.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}秒` : "发送"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">
                密码 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-foreground/80">
                确认密码 <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md mt-6"
            >
              注册
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">已有账号? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-primary text-sm"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
