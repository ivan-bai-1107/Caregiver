import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  Bell,
  Settings,
  Info,
  HelpCircle,
  Shield,
  FileText,
  Camera,
  Save,
  Moon,
  Sun,
  Globe,
  Type,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

/* ─── Personal Info Edit ─── */
function PersonalInfoSection() {
  const [form, setForm] = useState({
    nickname: "护理员小张",
    username: "caregiver_zhang",
    email: "zhang@example.com",
    phone: "138-1234-5678",
    region: "上海市 · 浦东新区",
    bio: "从业3年，擅长慢性病护理和老年人日常照护。",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("个人信息已保存");
  };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl">
            {form.nickname[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-md">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">点击更换头像</p>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">基本信息</h2>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">昵称</label>
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground/80 mb-2">用户名</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">联系方式</h2>
        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            邮箱
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            手机号
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            所在地区
          </label>
          <input
            type="text"
            name="region"
            value={form.region}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">个人简介</h2>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
          placeholder="介绍一下你自己..."
        />
        <p className="text-xs text-muted-foreground">{form.bio.length}/200</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-md"
      >
        {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
        <span>{saved ? "已保存" : "保存修改"}</span>
      </button>
    </div>
  );
}

/* ─── Notification Settings ─── */
function NotificationSection() {
  const [settings, setSettings] = useState([
    { key: "task", label: "任务提醒", desc: "护理任务到期提醒", on: true },
    { key: "health", label: "健康异常提醒", desc: "数据异常时推送通知", on: true },
    { key: "community", label: "社区回复通知", desc: "帖子有新回复时通知", on: false },
    { key: "system", label: "系统公告", desc: "系统更新与维护通知", on: true },
  ]);

  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  const toggle = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, on: !s.on } : s))
    );
    const item = settings.find((s) => s.key === key);
    if (item) {
      toast.success(item.on ? `已关闭「${item.label}」` : `已开启「${item.label}」`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">通知类型</h2>
        <div className="space-y-3">
          {settings.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                  item.on ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    item.on ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm">免打扰时段</h2>
            <p className="text-xs text-muted-foreground mt-0.5">在此时段内不接收通知推送</p>
          </div>
          <button
            onClick={() => {
              setQuietHours(!quietHours);
              toast.success(quietHours ? "已关闭免打扰模式" : "已开启免打扰模式");
            }}
            className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
              quietHours ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
                quietHours ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {quietHours && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">开始时间</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">结束时间</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── App Settings ─── */
function SettingsSection() {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");
  const [chartStyle, setChartStyle] = useState("line");
  const [language, setLanguage] = useState("zh-CN");

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">外观</h2>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-3">
            {theme === "light" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            主题模式
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" },
              { value: "system", label: "跟随系统" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  toast.success(`已切换为${opt.label}模式`);
                }}
                className={`py-2.5 rounded-xl border text-sm transition-colors ${
                  theme === opt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/60 hover:bg-muted/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-3">
            <Type className="w-3.5 h-3.5" />
            字体大小
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "small", label: "小" },
              { value: "medium", label: "标准" },
              { value: "large", label: "大" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFontSize(opt.value);
                  toast.success(`字体已调整为${opt.label}`);
                }}
                className={`py-2.5 rounded-xl border text-sm transition-colors ${
                  fontSize === opt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/60 hover:bg-muted/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <h2 className="text-sm text-muted-foreground uppercase tracking-wide">数据展示</h2>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            默认图表类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "line", label: "折线图" },
              { value: "bar", label: "柱状图" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChartStyle(opt.value)}
                className={`py-2.5 rounded-xl border text-sm transition-colors ${
                  chartStyle === opt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/30 border-border text-foreground/60 hover:bg-muted/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm text-foreground/80 mb-3">
            <Globe className="w-3.5 h-3.5" />
            语言
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-transparent focus:border-primary focus:outline-none transition-colors"
          >
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁体中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <h2 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">数据管理</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between py-3 border-b border-border/50 text-left">
            <div>
              <p className="text-sm">导出护理数据</p>
              <p className="text-xs text-muted-foreground mt-0.5">导出 Excel 格式的护理记录</p>
            </div>
            <span className="text-xs text-primary px-3 py-1.5 bg-primary/10 rounded-lg">导出</span>
          </button>
          <button className="w-full flex items-center justify-between py-3 text-left">
            <div>
              <p className="text-sm">清除缓存</p>
              <p className="text-xs text-muted-foreground mt-0.5">清除本地临时数据（约 2.3 MB）</p>
            </div>
            <span className="text-xs text-accent px-3 py-1.5 bg-accent/10 rounded-lg">清除</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Static Content Pages ─── */
const staticPages: Record<
  string,
  { title: string; icon: typeof User; content: string }
> = {
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

/* ─── Main Component ─── */
export function ProfileSubPage() {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const sectionKey = section || "";

  const getTitle = () => {
    switch (sectionKey) {
      case "info": return "个人信息编辑";
      case "notifications": return "通知提醒设置";
      case "settings": return "应用偏好设置";
      default: return staticPages[sectionKey]?.title || "页面未找到";
    }
  };

  const getIcon = () => {
    switch (sectionKey) {
      case "info": return User;
      case "notifications": return Bell;
      case "settings": return Settings;
      default: return staticPages[sectionKey]?.icon || Info;
    }
  };

  const Icon = getIcon();
  const isInteractive = ["info", "notifications", "settings"].includes(sectionKey);
  const staticPage = staticPages[sectionKey];

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            {getTitle()}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {sectionKey === "info" && <PersonalInfoSection />}
        {sectionKey === "notifications" && <NotificationSection />}
        {sectionKey === "settings" && <SettingsSection />}

        {!isInteractive && staticPage && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {staticPage.content}
            </div>
          </div>
        )}

        {!isInteractive && !staticPage && (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <Info className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">页面未找到</p>
          </div>
        )}
      </div>
    </div>
  );
}
