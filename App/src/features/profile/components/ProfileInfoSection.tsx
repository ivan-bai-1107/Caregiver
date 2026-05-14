import { useState } from "react";
import { Camera, Mail, Save, UserCircle2 } from "lucide-react";
import type { UserProfileDraft } from "@/features/profile/model";
import { resolveProfileMediaUrl } from "@/features/profile/services/profile.service";

interface ProfileInfoSectionProps {
  profileId: string;
  draft: UserProfileDraft;
  fieldErrors: Partial<Record<keyof UserProfileDraft, string>>;
  isSubmitting: boolean;
  isUploadingAvatar: boolean;
  onChange: <Key extends keyof UserProfileDraft>(key: Key, value: UserProfileDraft[Key]) => void;
  onAvatarUpload: (imageData: string) => Promise<void>;
  onSubmit: () => void;
}

export function ProfileInfoSection({
  profileId,
  draft,
  fieldErrors,
  isSubmitting,
  isUploadingAvatar,
  onChange,
  onAvatarUpload,
  onSubmit,
}: ProfileInfoSectionProps) {
  const avatarUrl = resolveProfileMediaUrl(draft.avatarUrl);
  const [avatarError, setAvatarError] = useState("");

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
          <input
            type="email"
            value={draft.email}
            onChange={(event) => onChange("email", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
          {fieldErrors.email ? (
            <p className="mt-2 text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
      >
        <Save className="w-5 h-5" />
        <span>{isSubmitting ? "保存中..." : "保存修改"}</span>
      </button>
    </div>
  );
}
