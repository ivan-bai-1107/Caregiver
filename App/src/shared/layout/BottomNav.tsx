import { useLocation, useNavigate } from "react-router";
import { Home, Heart, Sparkles, BookOpen, User } from "lucide-react";
import { appRoutes } from "../constants/routes";

const navItems = [
  { path: appRoutes.home, icon: Home, label: "首页" },
  { path: appRoutes.care, icon: Heart, label: "照护" },
  { path: appRoutes.aiAssistant, icon: Sparkles, label: "助手", isCenter: true },
  { path: appRoutes.knowledge, icon: BookOpen, label: "学习" },
  { path: appRoutes.profile, icon: User, label: "我的" },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === appRoutes.home) {
      return location.pathname === appRoutes.home;
    }

    if (path === appRoutes.care) {
      return (
        location.pathname.startsWith(appRoutes.care) ||
        location.pathname.startsWith(appRoutes.patients) ||
        location.pathname.startsWith(appRoutes.records) ||
        location.pathname.startsWith(appRoutes.tasks)
      );
    }

    if (path === appRoutes.aiAssistant) {
      return (
        location.pathname.startsWith(appRoutes.aiAssistant) ||
        location.pathname.startsWith("/ai-confirm")
      );
    }

    if (path === appRoutes.knowledge) {
      return (
        location.pathname.startsWith(appRoutes.knowledge) ||
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
                    active ? "bg-primary scale-105" : "bg-primary/90 hover:bg-primary"
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
              <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className="text-xs mt-0.5" style={{ fontWeight: active ? 600 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
