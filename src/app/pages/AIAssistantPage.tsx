import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Mic,
  FileText,
  CheckSquare,
  HelpCircle,
  ClipboardEdit,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  User,
  Bot,
} from "lucide-react";

type MessageRole = "user" | "ai";
type IntentType = "qa" | "draft-record" | "draft-task" | null;

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  intent?: IntentType;
  draftData?: { label: string; value: string; highlight?: boolean }[];
  sources?: string[];
  riskNote?: string;
}

const quickActions = [
  {
    icon: FileText,
    label: "记录护理信息",
    prompt: "帮我记录今天上午测量的血压，张明，收缩压130，舒张压85",
  },
  {
    icon: CheckSquare,
    label: "创建护理任务",
    prompt: "帮我创建一个每天早上8点给张明测血压的任务",
  },
  {
    icon: HelpCircle,
    label: "护理问题咨询",
    prompt: "高血压患者在日常饮食上需要注意哪些事项？",
  },
  {
    icon: ClipboardEdit,
    label: "辅助填写表单",
    prompt: "帮我填写新患者王强的信息：70岁男性，患有糖尿病",
  },
];

function detectIntent(text: string): IntentType {
  const isRecord =
    text.includes("记录") || text.includes("血压") || text.includes("体温") || text.includes("血糖") || text.includes("测量");
  const isTask =
    text.includes("任务") || text.includes("提醒") || text.includes("每天") || text.includes("创建");
  if (isRecord && !isTask) return "draft-record";
  if (isTask) return "draft-task";
  return "qa";
}

function generateAIResponse(text: string, intent: IntentType): Omit<ChatMessage, "id" | "timestamp"> {
  if (intent === "draft-record") {
    // Parse some mock data from user input
    const hasZhangMing = text.includes("张明");
    const patient = hasZhangMing ? "张明" : "患者";
    return {
      role: "ai",
      content: `好的，我已根据您的描述生成了一份护理记录草稿，请核对信息：`,
      intent: "draft-record",
      draftData: [
        { label: "患者", value: patient },
        { label: "记录类型", value: "血压测量（生命体征）" },
        { label: "收缩压", value: "130 mmHg", highlight: true },
        { label: "舒张压", value: "85 mmHg", highlight: true },
        { label: "记录时间", value: new Date().toLocaleDateString("zh-CN") + " 上午" },
        { label: "来源", value: "AI 预填写" },
      ],
      riskNote: "请核对以上信息是否准确，确认后数据将保存至护理记录。",
    };
  }
  if (intent === "draft-task") {
    return {
      role: "ai",
      content: `收到！我已为您解析任务信息并生成草稿：`,
      intent: "draft-task",
      draftData: [
        { label: "患者", value: "张明" },
        { label: "任务名称", value: "测量血压" },
        { label: "提醒时间", value: "每天 08:00" },
        { label: "周期规则", value: "每天重复" },
        { label: "优先级", value: "重要" },
        { label: "来源", value: "AI 预填写" },
      ],
    };
  }

  // QA responses based on keywords
  if (text.includes("高血压") || text.includes("血压")) {
    return {
      role: "ai",
      content:
        "高血压患者在日常饮食上需注意以下几点：\n\n1. **限制钠盐摄入**：每日盐摄入量建议不超过 5g（约一茶匙）\n2. **多食富含钾的食物**：如香蕉、土豆、菠菜，有助于辅助降压\n3. **减少高脂肪食物**：如肥肉、动物内脏等\n4. **避免饮酒**：控制咖啡因摄入，保持清淡饮食\n5. **规律进食**：避免暴饮暴食，少食多餐",
      intent: "qa",
      sources: ["中国高血压防治指南（2023修订版）", "世界卫生组织高血压管理指南"],
      riskNote: "以上为一般性护理参考建议，不构成医疗诊断或治疗方案。实际饮食计划应结合具体病情，请遵循主治医生的指导。",
    };
  }
  if (text.includes("糖尿病")) {
    return {
      role: "ai",
      content:
        "糖尿病患者的日常护理要点包括：\n\n1. **血糖监测**：每日定时测量空腹和餐后血糖，记录变化趋势\n2. **饮食控制**：低糖、低脂、高纤维饮食，控制总热量摄入\n3. **规律运动**：每天30分钟中等强度有氧运动\n4. **足部护理**：每天检查足部，保持清洁干燥\n5. **按时服药**：严格遵医嘱用药，不可擅自停药或调整剂量",
      intent: "qa",
      sources: ["中国2型糖尿病防治指南（2022版）", "国际糖尿病联合会护理标准"],
      riskNote: "以上为一般性护理参考建议，具体护理方案需根据患者实际情况由医生制定。",
    };
  }
  if (text.includes("压疮") || text.includes("卧床")) {
    return {
      role: "ai",
      content:
        "预防卧床患者压疮的关键措施：\n\n1. **定时翻身**：每2小时协助翻身一次，避免长时间压迫同一部位\n2. **皮肤检查**：每日检查骨突出部位，观察有无发红\n3. **保持皮肤清洁**：及时清理汗液及排泄物\n4. **使用减压器具**：如气垫床、减压垫等\n5. **加强营养**：保证蛋白质和维生素C的摄入",
      intent: "qa",
      sources: ["临床护理实践指南", "国际压疮预防与治疗指南"],
      riskNote: "如发现皮肤已出现破损，请立即联系医护人员处理。",
    };
  }

  // Default response
  return {
    role: "ai",
    content:
      "感谢您的提问！根据我的理解，以下是一些建议：\n\n1. 保持规律作息，充足睡眠有助于恢复\n2. 遵医嘱按时用药，不要自行调整剂量\n3. 保持良好心态，适当进行轻度活动\n4. 定期记录健康数据，观察变化趋势\n\n如需更详细的护理指导，建议咨询主治医生或查阅知识库中的相关文章。",
    intent: "qa",
    riskNote: "AI 回复仅供参考，具体护理操作请遵循专业医护人员指导。",
  };
}

let msgIdCounter = 0;
function genId() {
  return `msg-${++msgIdCounter}-${Date.now()}`;
}

export function AIAssistantPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Auto-resize textarea back
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Simulate AI response
    const intent = detectIntent(msg);
    setTimeout(() => {
      const aiResponse = generateAIResponse(msg, intent);
      const aiMsg: ChatMessage = {
        id: genId(),
        ...aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const isEmpty = messages.length === 0 && !isTyping;

  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Bold markdown
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-4 flex-shrink-0 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
              AI 护理助手
            </h1>
            <p className="text-xs text-white/60 mt-0.5">AI 仅供辅助，重要决策请遵医嘱</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {/* Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center pt-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
              你好，有什么可以帮您？
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-center px-4">
              我可以帮您记录护理数据、创建任务、回答护理问题
            </p>

            <div className="w-full grid grid-cols-2 gap-2.5 mb-6">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="bg-card rounded-2xl p-3.5 border border-border hover:border-primary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{action.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {action.prompt}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="w-full bg-muted/30 rounded-xl p-3 border border-border">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI 助手结果仅供护理参考，不构成医疗诊断建议。护理记录和任务经 AI 预填后，请核对确认后再保存。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                /* User Message */
                <div className="flex justify-end gap-2.5">
                  <div className="max-w-[80%]">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1 mr-1">
                      {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ) : (
                /* AI Message */
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="max-w-[85%] space-y-2.5">
                    {/* Main content bubble */}
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="text-sm text-foreground/85 space-y-1">
                        {renderContent(msg.content)}
                      </div>
                    </div>

                    {/* Draft Data Card */}
                    {msg.draftData && (
                      <div className="bg-card border border-primary/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {msg.intent === "draft-record" ? "护理记录草稿" : "护理任务草稿"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {msg.draftData.map((field, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                            >
                              <span className="text-xs text-muted-foreground">{field.label}</span>
                              <span
                                className={`text-sm font-medium ${
                                  field.highlight ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {field.value}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() =>
                            navigate(
                              `/ai-confirm?type=${msg.intent === "draft-record" ? "record" : "task"}`
                            )
                          }
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
                        >
                          去确认保存
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BookOpen className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">参考来源</span>
                        </div>
                        {msg.sources.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                            {s}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Risk Note */}
                    {msg.riskNote && (
                      <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl px-3 py-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/60 leading-relaxed">{msg.riskNote}</p>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground ml-1">
                      {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 border-t border-border bg-card flex-shrink-0">
        {/* Quick action chips when chatting */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1">
            {quickActions.map((a, i) => {
              const Icon = a.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(a.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground whitespace-nowrap hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Icon className="w-3 h-3" />
                  {a.label}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none text-sm"
              placeholder="输入护理需求或问题..."
              rows={1}
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center flex-shrink-0 hover:bg-muted transition-colors"
            title="语音输入"
          >
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}