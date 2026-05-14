import { useEffect, useMemo, useState } from "react";
import type { AdminUser, AdminUserStatus } from "@admin/model";
import { listAdminUsers, updateAdminUserStatus } from "@admin/services/admin.service";

export function useAdminUsersState() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all");
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAdminUsers({ keyword: keyword.trim() || undefined, page: 1, pageSize: 50 });
      setUsers(response.items ?? []);
      setTotal(Number(response.total ?? 0));
    } catch {
      setError("用户列表加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [keyword]);

  async function setUserStatus(user: AdminUser, status: AdminUserStatus) {
    setIsMutating(true);
    try {
      const updated = await updateAdminUserStatus(user.id, status);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      return updated;
    } finally {
      setIsMutating(false);
    }
  }

  const filteredUsers = useMemo(
    () => users.filter((user) => statusFilter === "all" || user.status === statusFilter),
    [statusFilter, users],
  );

  return {
    users: filteredUsers,
    total,
    keyword,
    statusFilter,
    isLoading,
    isMutating,
    error,
    setKeyword,
    setStatusFilter,
    setUserStatus,
    retry: loadUsers,
  };
}
