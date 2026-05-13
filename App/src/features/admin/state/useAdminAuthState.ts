import { useState } from "react";
import { loginAdmin } from "@/features/admin/services/admin.service";

export function useAdminAuthState() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginAdmin(email.trim(), password);
      return true;
    } catch {
      setError("管理员账号或密码错误。");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    password,
    isSubmitting,
    error,
    setEmail,
    setPassword,
    login,
  };
}
