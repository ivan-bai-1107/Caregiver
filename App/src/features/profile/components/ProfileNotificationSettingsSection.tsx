import type { UserNotificationSettings } from "@/features/profile/model";

interface ProfileNotificationSettingsSectionProps {
  settings: UserNotificationSettings;
  isSavingKey: keyof UserNotificationSettings | null;
  onToggle: <Key extends keyof UserNotificationSettings>(key: Key, value: UserNotificationSettings[Key]) => void;
}

const notificationItems: Array<{
  key: keyof UserNotificationSettings;
  label: string;
  description: string;
}> = [
  {
    key: "taskReminderEnabled",
    label: "任务提醒",
    description: "护理任务到期时发送提醒",
  },
  {
    key: "healthAlertEnabled",
    label: "健康异常提醒",
    description: "健康指标异常时发送提醒",
  },
  {
    key: "systemNotificationEnabled",
    label: "系统通知",
    description: "系统公告与维护提醒",
  },
];

export function ProfileNotificationSettingsSection({
  settings,
  isSavingKey,
  onToggle,
}: ProfileNotificationSettingsSectionProps) {
  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">通知类型</h2>
        <div className="space-y-3">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => onToggle(item.key, !settings[item.key])}
                disabled={isSavingKey === item.key}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  settings[item.key] ? "bg-primary" : "bg-muted"
                } disabled:opacity-70`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    settings[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <p className="text-sm font-medium mb-2">本轮说明</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          当前 OpenAPI 契约只提供任务提醒、健康异常提醒和系统通知三组开关。
          社区通知、免打扰时段等扩展项暂不纳入正式前端模型。
        </p>
      </div>
    </div>
  );
}
