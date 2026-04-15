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
  Heart,
  Calendar,
  Mail,
  Info,
} from "lucide-react";

export function ProfilePage() {
  const navigate = useNavigate();

  const userInfo = {
    nickname: "护理员小张",
    username: "caregiver_zhang",
    email: "zhang@example.com",
    role: "家庭护理员",
  };

  const stats = [
    { label: "护理记录", value: "126", icon: FileText, color: "text-primary" },
    { label: "护理任务", value: "48", icon: Calendar, color: "text-chart-2" },
    { label: "管理患者", value: "3", icon: Heart, color: "text-accent" },
  ];

  const menuSections = [
    {
      title: "账号与设置",
      items: [
        { icon: User, label: "个人信息编辑", path: "/profile/info", badge: null },
        { icon: Bell, label: "通知提醒设置", path: "/profile/notifications", badge: "2" },
        { icon: Settings, label: "应用偏好设置", path: "/profile/settings", badge: null },
      ],
    },
    {
      title: "关于系统",
      items: [
        { icon: Info, label: "关于医疗照顾者系统", path: "/profile/about", badge: null },
        { icon: HelpCircle, label: "使用指南与帮助", path: "/profile/guide", badge: null },
        { icon: Shield, label: "隐私政策", path: "/profile/privacy", badge: null },
        { icon: FileText, label: "服务条款", path: "/profile/terms", badge: null },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
            {userInfo.nickname[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
              {userInfo.nickname}
            </h1>
            <p className="text-white/70 text-sm mb-1">@{userInfo.username}</p>
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Mail className="w-3.5 h-3.5" />
              <span>{userInfo.email}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile/info")}
            className="p-2.5 bg-white/15 rounded-xl"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-xl mb-5">
          <Heart className="w-3.5 h-3.5" />
          <span className="text-sm">{userInfo.role}</span>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-0.5">{stat.value}</div>
                  <p className="text-white/70 text-xs">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-xs text-muted-foreground mb-3 px-1 uppercase tracking-wide">
              {section.title}
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors ${
                      itemIndex < section.items.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full mr-1">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => navigate("/login")}
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