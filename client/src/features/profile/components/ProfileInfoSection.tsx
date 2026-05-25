import { useState } from "react";
import { Camera, KeyRound, Mail, Save, Send, UserCircle2 } from "lucide-react";
import type { UserPasswordDraft, UserProfileDraft } from "@/features/profile/model";
import { resolveProfileMediaUrl } from "@/features/profile/services/profile.service";

interface ProfileInfoSectionProps {
  profileId: string;
  originalEmail: string;
  draft: UserProfileDraft;
  passwordDraft: UserPasswordDraft;
  fieldErrors: Partial<Record<keyof UserProfileDraft, string>>;
  passwordFieldErrors: Partial<Record<keyof UserPasswordDraft, string>>;
  isSubmitting: boolean;
  isPasswordSubmitting: boolean;
  isUploadingAvatar: boolean;
  isSendingEmailCode: boolean;
  emailCodeCountdown: number;
  onChange: <Key extends keyof UserProfileDraft>(key: Key, value: UserProfileDraft[Key]) => void;
  onPasswordChange: <Key extends keyof UserPasswordDraft>(key: Key, value: UserPasswordDraft[Key]) => void;
  onAvatarUpload: (imageData: string) => Promise<void>;
  onRequestEmailCode: () => Promise<void>;
  onSubmit: () => void;
  onPasswordSubmit: () => void;
}

export function ProfileInfoSection({
  profileId,
  originalEmail,
  draft,
  passwordDraft,
  fieldErrors,
  passwordFieldErrors,
  isSubmitting,
  isPasswordSubmitting,
  isUploadingAvatar,
  isSendingEmailCode,
  emailCodeCountdown,
  onChange,
  onPasswordChange,
  onAvatarUpload,
  onRequestEmailCode,
  onSubmit,
  onPasswordSubmit,
}: ProfileInfoSectionProps) {
  const avatarUrl = resolveProfileMediaUrl(draft.avatarUrl);
  const [avatarError, setAvatarError] = useState("");
  const isEmailChanged = draft.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

  function handleAvatarFile(file?: File) {
    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("请选择 PNG、JPG 或 WebP 图片。");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("头像图片不能超过 2MB。");
      return;
    }

    setAvatarError("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        void onAvatarUpload(result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <div className="w-24 h-24 overflow-hidden rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt="用户头像" className="h-full w-full object-cover" />
            ) : (
              draft.username.slice(0, 1) || "用"
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-md cursor-pointer">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={isUploadingAvatar}
              onChange={(event) => {
                handleAvatarFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {isUploadingAvatar ? "头像上传中..." : "点击相机上传 PNG、JPG 或 WebP 头像"}
        </p>
        {avatarError ? <p className="text-xs text-destructive">{avatarError}</p> : null}
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">账号信息</h2>

        <div>
          <label className="block text-sm text-foreground/80 mb-2">账户 ID</label>
          <div className="w-full px-4 py-3 bg-muted/30 rounded-xl text-sm text-muted-foreground">
            {profileId || "未获取到"}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <UserCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            用户名
          </label>
          <input
            type="text"
            value={draft.username}
            onChange={(event) => onChange("username", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
          {fieldErrors.username ? (
            <p className="mt-2 text-xs text-destructive">{fieldErrors.username}</p>
          ) : null}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            邮箱
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={draft.email}
              onChange={(event) => onChange("email", event.target.value)}
              className="min-w-0 flex-1 px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => void onRequestEmailCode()}
              disabled={!isEmailChanged || isSendingEmailCode || emailCodeCountdown > 0}
              className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 text-sm text-primary transition-colors hover:bg-primary/15 disabled:opacity-45"
            >
              <Send className="h-3.5 w-3.5" />
              {emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : "验证码"}
            </button>
          </div>
          {fieldErrors.email ? (
            <p className="mt-2 text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        {isEmailChanged ? (
          <div>
            <label className="block text-sm text-foreground/80 mb-2">新邮箱验证码</label>
            <input
              type="text"
              value={draft.emailCode}
              onChange={(event) => onChange("emailCode", event.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="请输入发送到新邮箱的验证码"
            />
            {fieldErrors.emailCode ? (
              <p className="mt-2 text-xs text-destructive">{fieldErrors.emailCode}</p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">修改邮箱前需要先验证新邮箱。</p>
            )}
          </div>
        ) : null}
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
      >
        <Save className="w-5 h-5" />
        <span>{isSubmitting ? "保存中..." : "保存修改"}</span>
      </button>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
          <KeyRound className="h-4 w-4" />
          修改密码
        </h2>

        <div>
          <label className="block text-sm text-foreground/80 mb-2">当前密码</label>
          <input
            type="password"
            value={passwordDraft.currentPassword}
            onChange={(event) => onPasswordChange("currentPassword", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            autoComplete="current-password"
          />
          {passwordFieldErrors.currentPassword ? (
            <p className="mt-2 text-xs text-destructive">{passwordFieldErrors.currentPassword}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm text-foreground/80 mb-2">新密码</label>
          <input
            type="password"
            value={passwordDraft.newPassword}
            onChange={(event) => onPasswordChange("newPassword", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            autoComplete="new-password"
          />
          {passwordFieldErrors.newPassword ? (
            <p className="mt-2 text-xs text-destructive">{passwordFieldErrors.newPassword}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm text-foreground/80 mb-2">确认新密码</label>
          <input
            type="password"
            value={passwordDraft.confirmPassword}
            onChange={(event) => onPasswordChange("confirmPassword", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            autoComplete="new-password"
          />
          {passwordFieldErrors.confirmPassword ? (
            <p className="mt-2 text-xs text-destructive">{passwordFieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <button
          onClick={onPasswordSubmit}
          disabled={isPasswordSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
        >
          <KeyRound className="w-5 h-5" />
          <span>{isPasswordSubmitting ? "修改中..." : "修改密码"}</span>
        </button>
      </div>
    </div>
  );
}
