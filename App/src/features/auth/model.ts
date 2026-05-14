import type { CurrentUser } from "@/shared/lib/auth";

export interface LoginDraft {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterDraft {
  username: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordDraft {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: CurrentUser;
}
