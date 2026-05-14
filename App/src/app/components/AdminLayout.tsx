import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FileCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Toaster } from "sonner";
import type { AdminMe } from "@/features/admin/model";
import { clearAdminToken, getAdminMe, getAdminToken } from "@/features/admin/services/admin.service";

const navItems = [
  { path: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { path: "/admin/users", label: "用户管理", icon: Users },
  { path: "/admin/reviews", label: "内容审核", icon: FileCheck },
  { path: "/admin/content", label: "内容管理", icon: FileText },
  { path: "/admin/prompts", label: "Prompt 管理", icon: Sparkles },
  { path: "/admin/ai-logs", label: "AI 日志", icon: ScrollText },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let isMounted = true;

    async function loadAdmin() {
      try {
        const nextAdmin = await getAdminMe();
        if (isMounted) {
          setAdmin(nextAdmin);
        }
      } catch {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
      }
    }

    void loadAdmin();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  function handleLogout() {
    clearAdminToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm" style={{ fontFamily: "var(--font-display)" }}>
                医疗照顾者系统
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
              {(admin?.username ?? "管").slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{admin?.username ?? "管理员"}</p>
              <p className="text-xs text-gray-500">{admin?.email ?? "admin@example.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <Toaster position="top-right" richColors />
        <Outlet />
      </main>
    </div>
  );
}
