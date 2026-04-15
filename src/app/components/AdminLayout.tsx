import { NavLink, Outlet, useNavigate } from "react-router";
import { LayoutDashboard, Users, FileCheck, FileText, LogOut, Shield, Sparkles, ScrollText } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>医疗照顾者系统</h1>
              <p className="text-xs text-gray-500">后台管理</p>
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
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
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
              管
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">管理员</p>
              <p className="text-xs text-gray-500">admin@care.com</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/login")}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}