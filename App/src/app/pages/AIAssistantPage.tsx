import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckSquare,
  ChevronRight,
  FileText,
  HelpCircle,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import type { AIAssistantResponse, AIDraftPayload, AIDraftType, AIIntent } from "@/entities/ai/model";
import { aiDraftTypeLabels } from "@/entities/ai/mapper";
import { sendAssistantMessage, storeAIDraft } from "@/features/ai/services/assistant.service";

type MessageRole = "user" | "ai";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  intent?: AIIntent;
  draftType?: AIDraftType;
  draftPayload?: AIDraftPayload;
  sources?: string[];
  riskNote?: string;
  generatedBy?: string;
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
];

let messageId = 0;

function genMessageId() {
  messageId += 1;
  return `ai-msg-${messageId}-${Date.now()}`;
}

function renderContent(content: string) {
  return content.split("\n").map((line, index) => {
    if (!line.trim()) {
      return <br key={index} />;
    }

    return (
      <p key={index} className="leading-relaxed">
        {line}
      </p>
    );
  });
}

function getDraftRows(draftType: Exclude<AIDraftType, null>, payload: NonNullable<AIDraftPayload>) {
  if (draftType === "record") {
    const metrics = (payload.metrics ?? {}) as Record<string, unknown>;
    return [
      ["患者ID", payload.patientId],
      ["记录类型", payload.recordType],
      ["收缩压", metrics.bloodPressureSystolic],
      ["舒张压", metrics.bloodPressureDiastolic],
      ["记录时间", payload.occurredAt],
    ].filter(([, value]) => value !== undefined && value !== "");
  }

  return [
    ["患者ID", payload.patientId],
    ["任务标题", payload.title],
    ["任务类型", payload.taskType],
    ["提醒时间", payload.remindTime],
    ["重复规则", payload.repeatRule],
  ].filter(([, value]) => value !== undefined && value !== "");
}

function isConfirmableDraftType(draftType: AIDraftType): draftType is Exclude<AIDraftType, null> {
  return draftType === "record" || draftType === "task";
}

function toAiMessage(response: AIAssistantResponse): ChatMessage {
  return {
    id: genMessageId(),
    role: "ai",
    content: response.answerText,
    timestamp: new Date(),
    intent: response.intent,
    draftType: response.draftType,
    draftPayload: response.draftPayload,
    sources: response.sources,
    riskNote: response.riskNote,
    generatedBy: response.generatedBy,
  };
}

export function AIAssistantPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: genMessageId(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await sendAssistantMessage({
        message,
        conversationId,
      });
      setConversationId(response.conversationId);
      setMessages((currentMessages) => [...currentMessages, toAiMessage(response)]);
    } catch {
      setError("AI 助手暂时不可用，请稍后重试。");
    } finally {
      setIsSending(false);
    }
  }

  function handleConfirmDraft(message: ChatMessage) {
    const draftType = message.draftType ?? null;
    if (!isConfirmableDraftType(draftType) || !message.draftPayload) {
      return;
    }

    storeAIDraft({
      draftType,
      draftPayload: message.draftPayload,
      answerText: message.content,
      riskNote: message.riskNote ?? "请核对 AI 草稿后再确认保存。",
    });
    navigate(`/ai-confirm?type=${draftType}`);
  }

  const isEmpty = messages.length === 0 && !isSending;

  return (
    <div className="mobile-fixed-page bg-background">
      <div className="mobile-fixed-page-header bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-5 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
              AI 护理助手
            </h1>
            <p className="text-xs text-white/65 mt-0.5">草稿确认后才会写入系统</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div ref={scrollRef} className="mobile-fixed-page-body px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center pt-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-medium mb-1" style={{ fontFamily: "var(--font-display)" }}>
              今天需要我帮你处理什么？
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-center px-4">
              可以生成护理记录草稿、护理任务草稿，或回答护理问题
            </p>
            <div className="w-full grid grid-cols-1 gap-2.5 mb-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.prompt)}
                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{action.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="w-full bg-muted/30 rounded-xl p-3 border border-border">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI 回复仅供护理参考，不构成医疗诊断建议。护理记录和任务必须核对确认后再保存。
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end gap-2.5">
                  <div className="max-w-[80%]">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1 mr-1">
                      {message.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="max-w-[85%] space-y-2.5">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="text-sm text-foreground/85 space-y-1">{renderContent(message.content)}</div>
                    </div>

                    {message.draftType && message.draftPayload ? (
                      <div className="bg-card border border-primary/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {aiDraftTypeLabels[message.draftType]}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getDraftRows(message.draftType, message.draftPayload).map(([label, value]) => (
                            <div
                              key={String(label)}
                              className="flex items-center justify-between gap-4 py-1.5 border-b border-border/50 last:border-0"
                            >
                              <span className="text-xs text-muted-foreground">{String(label)}</span>
                              <span className="text-sm font-medium text-foreground text-right truncate">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleConfirmDraft(message)}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-colors"
                        >
                          去确认保存
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}

                    {message.generatedBy ? (
                      <div className="inline-flex rounded-lg bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        {message.generatedBy === "deepseek" ? "DeepSeek" : "本地兜底"}
                      </div>
                    ) : null}

                    {message.sources && message.sources.length > 0 ? (
                      <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                        {message.sources.map((source) => (
                          <p key={source} className="text-xs text-muted-foreground">
                            {source}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {message.riskNote ? (
                      <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl px-3 py-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground/60 leading-relaxed">{message.riskNote}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isSending ? (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border bg-card flex-shrink-0">
        {error ? <p className="text-xs text-accent mb-2">{error}</p> : null}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            className="flex-1 px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-colors resize-none text-sm"
            placeholder="输入护理需求或问题..."
            rows={1}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
