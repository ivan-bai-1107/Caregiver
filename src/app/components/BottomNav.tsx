import { useNavigate, useLocation } from "react-router";
import { Home, Heart, Sparkles, BookOpen, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "首页" },
  { path: "/care", icon: Heart, label: "照护" },
  { path: "/ai-assistant", icon: Sparkles, label: "助手", isCenter: true },
  { path: "/knowledge", icon: BookOpen, label: "学习" },
  { path: "/profile", icon: User, label: "我的" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/care") {
      return (
        location.pathname.startsWith("/care") ||
        location.pathname.startsWith("/patients") ||
        location.pathname.startsWith("/records") ||
        location.pathname.startsWith("/tasks")
      );
    }
    if (path === "/ai-assistant") {
      return (
        location.pathname.startsWith("/ai-assistant") ||
        location.pathname.startsWith("/ai-confirm")
      );
    }
    if (path === "/knowledge") {
      return (
        location.pathname.startsWith("/knowledge") ||
        location.pathname.startsWith("/community")
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 pb-2 pt-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    active
                      ? "bg-primary scale-105"
                      : "bg-primary/90 hover:bg-primary"
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-xs mt-1 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  style={{ fontWeight: active ? 600 : 400 }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "stroke-[2.5]" : "stroke-[2]"
                }`}
              />
              <span
                className="text-xs mt-0.5"
                style={{ fontWeight: active ? 600 : 400 }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
