import { useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, HelpCircle, Info, Shield, User } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ProfileInfoSection } from "@/features/profile/components/ProfileInfoSection";
import { ProfileNotificationSettingsSection } from "@/features/profile/components/ProfileNotificationSettingsSection";
import { ProfilePreferencesSection } from "@/features/profile/components/ProfilePreferencesSection";
import { StaticProfileContent } from "@/features/profile/components/StaticProfileContent";
import { useProfileInfoState } from "@/features/profile/state/useProfileInfoState";
import { useProfileNotificationSettingsState } from "@/features/profile/state/useProfileNotificationSettingsState";
import { useProfilePreferencesState } from "@/features/profile/state/useProfilePreferencesState";

const staticPages: Record<string, { title: string; icon: typeof User; content: string }> = {
  about: {
    title: "关于医疗照顾者系统",
    icon: Info,
    content:
      "医疗照顾者客户端系统 v1.0.0\n\n本系统面向患者家属、护工等医疗照顾者群体，用于管理患者信息、记录护理数据、创建护理任务、查看健康趋势，以及使用 AI 助手辅助问答。\n\n开发团队致力于为照顾者提供专业、温和、易用的护理管理工具。",
  },
  guide: {
    title: "使用指南与帮助",
    icon: HelpCircle,
    content:
      "快速入门：\n\n1. 首页查看今日任务和患者状态概览\n2. 在「照护」页面管理患者信息和护理记录\n3. 使用 AI 助手快速记录数据或咨询护理问题\n4. 在「学习」版块浏览护理知识文章\n5. 在「我的」页面管理个人信息和偏好设置\n\n如有疑问，请联系客服：support@careapp.com",
  },
  privacy: {
    title: "隐私政策",
    icon: Shield,
    content:
      "我们重视您的隐私保护。\n\n• 您的个人信息仅用于提供护理管理服务\n• 患者健康数据经加密存储，不会未经授权共享\n• 您可随时请求导出或删除个人数据\n• AI 助手对话内容不会用于训练模型\n\n最后更新：2026年4月14日",
  },
  terms: {
    title: "服务条款",
    icon: FileText,
    content:
      "欢迎使用医疗照顾者系统。\n\n• 本系统仅提供护理辅助管理功能，不构成医疗诊断或治疗建议\n• 用户应确保录入信息的准确性\n• AI 助手回复仅供参考，重要决策请遵医嘱\n• 禁止将本系统用于非法用途\n\n最后更新：2026年4月14日",
  },
};

function renderStateBox(titleText: string, bodyText: string, retry?: () => void) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
      <p className="text-sm font-medium text-accent">{titleText}</p>
      <p className="mt-2 text-sm text-foreground/75">{bodyText}</p>
      {retry ? (
        <button
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => void retry()}
        >
          重新加载
        </button>
      ) : null}
    </div>
  );
}

function ProfileInfoContent() {
  const infoState = useProfileInfoState();

  if (infoState.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        个人资料加载中...
      </div>
    );
  }

  if (infoState.loadError) {
    return renderStateBox("个人资料加载失败", infoState.loadError, infoState.retry);
  }

  return (
    <ProfileInfoSection
      profileId={infoState.profileId}
      draft={infoState.draft}
      fieldErrors={infoState.fieldErrors}
      isSubmitting={infoState.isSubmitting}
      onChange={infoState.updateDraft}
      onSubmit={async () => {
        const result = await infoState.submit();
        if (!result.ok) {
          toast.error("请先完善个人资料");
          return;
        }
        toast.success("个人资料已保存");
      }}
    />
  );
}

function ProfileNotificationsContent() {
  const notificationState = useProfileNotificationSettingsState();

  if (notificationState.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        通知设置加载中...
      </div>
    );
  }

  if (notificationState.loadError) {
    return renderStateBox("通知设置加载失败", notificationState.loadError, notificationState.retry);
  }

  return (
    <ProfileNotificationSettingsSection
      settings={notificationState.settings}
      isSavingKey={notificationState.isSavingKey}
      onToggle={async (key, value) => {
        const result = await notificationState.updateSetting(key, value);
        if (!result.ok) {
          toast.error("通知设置保存失败，请稍后重试。");
          return;
        }
        toast.success("通知设置已更新");
      }}
    />
  );
}

function ProfilePreferencesContent() {
  const preferencesState = useProfilePreferencesState();

  if (preferencesState.isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        偏好设置加载中...
      </div>
    );
  }

  if (preferencesState.loadError) {
    return renderStateBox("偏好设置加载失败", preferencesState.loadError, preferencesState.retry);
  }

  return (
    <ProfilePreferencesSection
      preferences={preferencesState.preferences}
      isSubmitting={preferencesState.isSubmitting}
      onChange={preferencesState.updatePreference}
      onSubmit={async () => {
        const result = await preferencesState.submit();
        if (!result.ok) {
          toast.error("偏好设置保存失败，请稍后重试。");
          return;
        }
        toast.success("偏好设置已保存");
      }}
    />
  );
}

export function ProfileSubPage() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const sectionKey = section || "";

  const title =
    sectionKey === "info"
      ? "个人信息编辑"
      : sectionKey === "notifications"
        ? "通知提醒设置"
        : sectionKey === "settings"
          ? "应用偏好设置"
        : staticPages[sectionKey]?.title || "页面未找到";

  function renderContent() {
    if (sectionKey === "info") {
      return <ProfileInfoContent />;
    }

    if (sectionKey === "notifications") {
      return <ProfileNotificationsContent />;
    }

    if (sectionKey === "settings") {
      return <ProfilePreferencesContent />;
    }

    if (staticPages[sectionKey]) {
      return (
        <StaticProfileContent
          icon={staticPages[sectionKey].icon}
          content={staticPages[sectionKey].content}
        />
      );
    }

    return (
      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <Info className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">页面未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6">{renderContent()}</div>
    </div>
  );
}
