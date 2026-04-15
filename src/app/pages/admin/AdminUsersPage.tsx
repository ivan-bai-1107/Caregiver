import { Search, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface UserItem {
  id: number;
  name: string;
  phone: string;
  role: string;
  patients: number;
  joinDate: string;
  status: "active" | "inactive";
  lastActive: string;
}

export function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState<UserItem[]>([
    { id: 1, name: "张三", phone: "138****1234", role: "护理员", patients: 3, joinDate: "2026-01-15", status: "active", lastActive: "2小时前" },
    { id: 2, name: "李医生", phone: "139****5678", role: "医护人员", patients: 0, joinDate: "2026-02-20", status: "active", lastActive: "1天前" },
    { id: 3, name: "王家属", phone: "136****9012", role: "家属", patients: 1, joinDate: "2026-03-05", status: "active", lastActive: "刚刚" },
    { id: 4, name: "赵护工", phone: "137****3456", role: "护理员", patients: 2, joinDate: "2025-12-10", status: "inactive", lastActive: "7天前" },
    { id: 5, name: "刘阿姨", phone: "135****7890", role: "家属", patients: 1, joinDate: "2026-03-20", status: "active", lastActive: "3小时前" },
    { id: 6, name: "陈护士", phone: "133****2345", role: "医护人员", patients: 0, joinDate: "2026-01-08", status: "active", lastActive: "5小时前" },
  ]);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ user: UserItem; action: "enable" | "disable" } | null>(null);

  const toggleStatus = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const } : u));
    setShowConfirm(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchQuery) || user.phone.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>用户管理</h1>
        <p className="text-gray-500">共 {users.length} 个注册用户</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="搜索用户姓名或手机号"
            />
          </div>
          <div className="flex items-center gap-2">
            {[{ key: "all", label: "全部" }, { key: "active", label: "活跃" }, { key: "inactive", label: "不活跃" }].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  filterStatus === f.key ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">用户</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">角色</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">管理患者</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">注册时间</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">最后活跃</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">状态</th>
              <th className="text-right py-4 px-6 text-sm text-gray-500 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs rounded-lg ${
                    user.role === "医护人员" ? "bg-blue-50 text-blue-600" :
                    user.role === "护理员" ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{user.patients} 人</td>
                <td className="py-4 px-6 text-sm text-gray-500">{user.joinDate}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{user.lastActive}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    user.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.status === "active" ? "活跃" : "已禁用"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDetailUser(user)}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      详情
                    </button>
                    {user.status === "active" ? (
                      <button
                        onClick={() => setShowConfirm({ user, action: "disable" })}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        禁用
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirm({ user, action: "enable" })}
                        className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        启用
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="py-16 text-center text-gray-400">没有找到符合条件的用户</div>
        )}
      </div>

      {/* Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetailUser(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                {detailUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl text-gray-900">{detailUser.name}</h3>
                <p className="text-gray-500">{detailUser.phone}</p>
              </div>
              <span className={`ml-auto px-3 py-1 text-xs rounded-full ${
                detailUser.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
              }`}>
                {detailUser.status === "active" ? "活跃" : "已禁用"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "用户角色", value: detailUser.role },
                { label: "管理患者", value: `${detailUser.patients} 人` },
                { label: "注册时间", value: detailUser.joinDate },
                { label: "最后活跃", value: detailUser.lastActive },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDetailUser(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                关闭
              </button>
              <button
                onClick={() => { setShowConfirm({ user: detailUser, action: detailUser.status === "active" ? "disable" : "enable" }); setDetailUser(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-colors ${
                  detailUser.status === "active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {detailUser.status === "active" ? "禁用用户" : "启用用户"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
              showConfirm.action === "disable" ? "bg-red-50" : "bg-green-50"
            }`}>
              {showConfirm.action === "disable" ? <UserX className="w-7 h-7 text-red-500" /> : <UserCheck className="w-7 h-7 text-green-500" />}
            </div>
            <h3 className="text-lg text-gray-900 mb-2">
              确认{showConfirm.action === "disable" ? "禁用" : "启用"}用户？
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {showConfirm.action === "disable"
                ? `禁用后，${showConfirm.user.name} 将无法登录系统。`
                : `启用后，${showConfirm.user.name} 将可以正常使用系统。`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button
                onClick={() => toggleStatus(showConfirm.user.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm text-white transition-colors ${
                  showConfirm.action === "disable" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                确认{showConfirm.action === "disable" ? "禁用" : "启用"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
