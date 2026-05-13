import { Camera, Mail, Save, UserCircle2 } from "lucide-react";
import type { UserProfileDraft } from "@/features/profile/model";

interface ProfileInfoSectionProps {
  profileId: string;
  draft: UserProfileDraft;
  fieldErrors: Partial<Record<keyof UserProfileDraft, string>>;
  isSubmitting: boolean;
  onChange: <Key extends keyof UserProfileDraft>(key: Key, value: UserProfileDraft[Key]) => void;
  onSubmit: () => void;
}

export function ProfileInfoSection({
  profileId,
  draft,
  fieldErrors,
  isSubmitting,
  onChange,
  onSubmit,
}: ProfileInfoSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl">
            {draft.username.slice(0, 1) || "用"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
            <Camera className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">头像上传未接入，本轮仅同步账号信息</p>
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
