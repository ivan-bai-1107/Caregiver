import { useNavigate } from "react-router";
import {
  User,
  Settings,
  Bell,
  FileText,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Mail,
  Info,
} from "lucide-react";
import { logout } from "@/features/auth/services/auth.service";
import { useProfilePageState } from "@/features/profile/state/useProfilePageState";

export function ProfilePage() {
  const navigate = useNavigate();
  const { profile, stats, isLoading, error, retry } = useProfilePageState();

  const menuSections = [
    {
      title: "账号与设置",
      items: [
        { icon: User, label: "个人信息编辑", path: "/profile/info" },
        { icon: Bell, label: "通知提醒设置", path: "/profile/notifications" },
        { icon: Settings, label: "应用偏好设置", path: "/profile/settings" },
      ],
    },
    {
      title: "关于系统",
      items: [
        { icon: Info, label: "关于医疗照顾者系统", path: "/profile/about" },
        { icon: HelpCircle, label: "使用指南与帮助", path: "/profile/guide" },
        { icon: Shield, label: "隐私政策", path: "/profile/privacy" },
        { icon: FileText, label: "服务条款", path: "/profile/terms" },
      ],
    },
  ];

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
            {profile?.username.slice(0, 1) || "用"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
              {profile?.username || "用户"}
            </h1>
            <p className="text-white/70 text-sm mb-1">账户 ID：{profile?.id || "--"}</p>
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Mail className="w-3.5 h-3.5" />
              <span>{profile?.email || "未获取到邮箱"}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile/info")}
            className="p-2.5 bg-white/15 rounded-xl"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl mb-5">
          <Info className="w-3.5 h-3.5" />
          <span className="text-sm">当前账号信息</span>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-0.5">{stats?.recordCount ?? "--"}</div>
              <p className="text-white/70 text-xs">护理记录</p>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-2xl mb-0.5">{stats?.taskPendingCount ?? "--"}</div>
              <p className="text-white/70 text-xs">待办任务</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-0.5">{stats?.patientCount ?? "--"}</div>
              <p className="text-white/70 text-xs">管理患者</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-fixed-page-body px-6 py-6 space-y-6">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            个人中心加载中...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-sm font-medium text-accent">个人中心加载失败</p>
            <p className="mt-2 text-sm text-foreground/75">{error}</p>
            <button
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => void retry()}
            >
              重新加载
            </button>
          </div>
        ) : null}

        {!isLoading && !error
          ? menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className="text-xs text-muted-foreground mb-3 px-1 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors ${
                          itemIndex < section.items.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          : null}

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-destructive/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <span className="flex-1 text-left text-sm text-destructive">退出登录</span>
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">医疗照顾者客户端系统</p>
          <p className="text-xs text-muted-foreground">版本 1.0.0 · 内容仅供护理参考</p>
        </div>
      </div>
    </div>
  );
}
