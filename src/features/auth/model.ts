import type { CurrentUser } from "@/shared/lib/auth";

export interface LoginDraft {
  email: string;
  password: string;
}

export interface RegisterDraft {
  username: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: CurrentUser;
}
