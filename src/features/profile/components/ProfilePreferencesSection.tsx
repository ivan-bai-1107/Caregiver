import { Globe, Moon, Save, Sun } from "lucide-react";
import type { UserPreferences } from "@/features/profile/model";

interface ProfilePreferencesSectionProps {
  preferences: UserPreferences;
  isSubmitting: boolean;
  onChange: <Key extends keyof UserPreferences>(key: Key, value: UserPreferences[Key]) => void;
  onSubmit: () => void;
}

const themeOptions = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "跟随系统", icon: Globe },
];

export function ProfilePreferencesSection({
  preferences,
  isSubmitting,
  onChange,
  onSubmit,
}: ProfilePreferencesSectionProps) {
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">外观偏好</h2>

        <div>
          <label className="block text-sm text-foreground/80 mb-3">主题模式</label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onChange("theme", option.value)}
                  className={`rounded-xl border px-3 py-3 text-sm transition-colors ${
                    preferences.theme === option.value
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/30 border-border text-foreground/70 hover:bg-muted/50"
                  }`}
                  type="button"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            语言
          </label>
          <input
            type="text"
            value={preferences.language}
            onChange={(event) => onChange("language", event.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            placeholder="请输入语言代码或语言名称"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <p className="text-sm font-medium mb-2">本轮说明</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          当前 OpenAPI 契约仅提供 `theme` 与 `language` 两组偏好字段。
          字体大小、图表样式等未出现在正式契约中，因此不再保留为可提交设置。
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70"
      >
        <Save className="w-5 h-5" />
        <span>{isSubmitting ? "保存中..." : "保存偏好"}</span>
      </button>
    </div>
  );
}
