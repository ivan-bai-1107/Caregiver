import { Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { adminUserStatusLabels, type AdminUser } from "@/features/admin/model";
import { useAdminUsersState } from "@/features/admin/state/useAdminUsersState";
import { formatDateTimeLabel } from "@/shared/lib/date";

export function AdminUsersPage() {
  const {
    users,
    total,
    keyword,
    statusFilter,
    isLoading,
    isMutating,
    error,
    setKeyword,
    setStatusFilter,
    setUserStatus,
    retry,
  } = useAdminUsersState();

  async function handleToggle(user: AdminUser) {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    try {
      await setUserStatus(user, nextStatus);
      toast.success(nextStatus === "active" ? "用户已启用" : "用户已禁用");
    } catch {
      toast.error("用户状态更新失败");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>用户管理</h1>
        <p className="text-gray-500">共 {total} 个注册用户，状态切换会写入数据库。</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:outline-none transition-colors text-sm"
              placeholder="搜索用户名或邮箱"
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "全部" },
              { key: "active", label: "正常" },
              { key: "disabled", label: "已禁用" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  statusFilter === filter.key ? "bg-primary text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
          {error}
          <button onClick={() => void retry()} className="ml-3 underline">重新加载</button>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">用户</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">管理患者</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">注册时间</th>
              <th className="text-left py-4 px-6 text-sm text-gray-500 font-normal">状态</th>
              <th className="text-right py-4 px-6 text-sm text-gray-500 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{user.patientCount} 人</td>
                <td className="py-4 px-6 text-sm text-gray-500">{formatDateTimeLabel(user.createdAt)}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs rounded-full ${
                    user.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {adminUserStatusLabels[user.status]}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => void handleToggle(user)}
                    disabled={isMutating}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                      user.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {user.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {user.status === "active" ? "禁用" : "启用"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">正在加载用户...</div>
        ) : null}
        {!isLoading && users.length === 0 ? (
          <div className="py-16 text-center text-gray-400">没有找到符合条件的用户</div>
        ) : null}
      </div>
    </div>
  );
}
