import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Bot,
  CheckSquare,
  ChevronRight,
  FileText,
  HelpCircle,
  Mic,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import type { AIAssistantResponse, AIDraftPayload, AIDraftType, AIIntent } from "@/entities/ai/model";
import { aiDraftTypeLabels } from "@/entities/ai/mapper";
import { recordTypeLabels } from "@/entities/care-record/mapper";
import { careTaskRepeatRuleLabels, careTaskTypeLabels } from "@/entities/care-task/mapper";
import { sendAssistantMessageStream, storeAIDraft } from "@/features/ai/services/assistant.service";
import { listPatients } from "@/features/patients/services/patient.service";
import { formatDateTimeLabel } from "@/shared/lib/date";

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

function textValue(value: unknown, fallback = "待确认") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value);
}

function formatDraftDate(value: unknown) {
  const rawValue = textValue(value, "");
  if (!rawValue) {
    return "待确认";
  }

  try {
    return formatDateTimeLabel(rawValue);
  } catch {
    return rawValue;
  }
}

function getRecordTypeLabel(value: unknown) {
  const key = textValue(value, "") as keyof typeof recordTypeLabels;
  return recordTypeLabels[key] ?? textValue(value);
}

function getTaskTypeLabel(value: unknown) {
  const key = textValue(value, "") as keyof typeof careTaskTypeLabels;
  return careTaskTypeLabels[key] ?? textValue(value);
}

function getRepeatRuleLabel(value: unknown) {
  const key = textValue(value, "") as keyof typeof careTaskRepeatRuleLabels;
  return careTaskRepeatRuleLabels[key] ?? textValue(value);
}

function addMetricRow(rows: Array<[string, string]>, label: string, value: unknown, unit = "") {
  if (value === undefined || value === null || value === "") {
    return;
  }
  rows.push([label, `${String(value)}${unit ? ` ${unit}` : ""}`]);
}

function getDraftRows(
  draftType: Exclude<AIDraftType, null>,
  payload: NonNullable<AIDraftPayload>,
  patientNameMap: Map<string, string>,
) {
  const patientId = textValue(payload.patientId, "");
  const patientName = textValue(payload.patientName, patientNameMap.get(patientId) ?? "请在确认页选择患者");
  if (draftType === "record") {
    const metrics = (payload.metrics ?? {}) as Record<string, unknown>;
    const rows: Array<[string, string]> = [
      ["患者", patientName],
      ["记录类型", getRecordTypeLabel(payload.recordType)],
    ];

    if (payload.recordType === "blood_pressure") {
      const systolic = textValue(metrics.bloodPressureSystolic, "");
      const diastolic = textValue(metrics.bloodPressureDiastolic, "");
      if (systolic || diastolic) {
        rows.push(["血压", `${systolic || "待确认"}/${diastolic || "待确认"} mmHg`]);
      }
    } else {
      addMetricRow(rows, "体温", metrics.temperature, "°C");
      addMetricRow(rows, "血糖", metrics.bloodSugar, "mmol/L");
      addMetricRow(rows, "心率", metrics.heartRate, "次/分");
      addMetricRow(rows, "药品", metrics.medicationName);
      addMetricRow(rows, "剂量", metrics.medicationDose);
      addMetricRow(rows, "饮食内容", metrics.dietDescription);
      addMetricRow(rows, "状态说明", metrics.observationText);
    }

    rows.push(["记录时间", formatDraftDate(payload.occurredAt)]);
    return rows;
  }

  return [
    ["患者", patientName],
    ["任务标题", textValue(payload.title)],
    ["任务类型", getTaskTypeLabel(payload.taskType)],
    ["提醒时间", formatDraftDate(payload.remindTime)],
    ["重复", getRepeatRuleLabel(payload.repeatRule)],
  ];
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
    riskNote: normalizeRiskNote(response.riskNote),
    generatedBy: response.generatedBy,
  };
}

function normalizeRiskNote(value?: string) {
  const text = value?.trim() ?? "";
  const normalized = text.toLowerCase();
  if (!text || ["无", "暂无", "没有", "none", "null", "n/a", "na"].includes(normalized)) {
    return undefined;
  }
  return text;
}

export function AIAssistantPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    abort: () => void;
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((event: any) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
  } | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientNameMap, setPatientNameMap] = useState<Map<string, string>>(() => new Map());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void listPatients()
      .then((patients) => {
        if (!isMounted) {
          return;
        }
        setPatientNameMap(new Map(patients.map((patient) => [patient.id, patient.name])));
      })
      .catch(() => {
        if (isMounted) {
          setPatientNameMap(new Map());
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

    const aiMessageId = genMessageId();
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await sendAssistantMessageStream({
        message,
        conversationId,
      }, (delta) => {
        setMessages((currentMessages) =>
          currentMessages.map((item) =>
            item.id === aiMessageId ? { ...item, content: item.content + delta } : item,
          ),
        );
      });
      setConversationId(response.conversationId);
      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.id === aiMessageId
            ? {
                ...toAiMessage(response),
                id: aiMessageId,
                content: item.content || response.answerText,
                timestamp: item.timestamp,
              }
            : item,
        ),
      );
    } catch {
      setMessages((currentMessages) => currentMessages.filter((item) => item.id !== aiMessageId));
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

  function handleVoiceInput() {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      setError("语音输入需要浏览器安全来源。局域网访问请使用 HTTPS，或用 Chrome 安全来源模式打开本页面。");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("当前浏览器不支持语音输入，请使用 Chrome 或手动输入。");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results ?? [])
        .map((result: any) => result?.[0]?.transcript ?? "")
        .join("")
        .trim();

      if (transcript) {
        setInput((current) => `${current}${current ? " " : ""}${transcript}`);
      }
    };
    recognition.onerror = (event: any) => {
      const message =
        event?.error === "not-allowed"
          ? "麦克风权限未开启，请在 Chrome 地址栏允许麦克风后重试。"
          : "语音识别失败，请重新尝试或手动输入。";
      setError(message);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    setError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("语音输入启动失败，请刷新页面后重试。");
      setIsListening(false);
    }
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
                          {getDraftRows(message.draftType, message.draftPayload, patientNameMap).map(([label, value]) => (
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

                    {message.sources && message.sources.length > 0 ? (
                      <div className="bg-muted/30 rounded-xl px-3 py-2.5">
                        {message.sources.map((source) => (
                          <p key={source} className="text-xs text-muted-foreground">
                            {source}
                          </p>
                        ))}
                      </div>
                    ) : null}

                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      <div className="mobile-fixed-page-footer border-t border-border bg-card">
        {error ? <p className="text-xs text-accent mb-2">{error}</p> : null}
        <div className="flex items-end gap-2">
          <button
            onClick={handleVoiceInput}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              isListening
                ? "bg-accent text-accent-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
            aria-label={isListening ? "停止语音输入" : "开始语音输入"}
            type="button"
          >
            <Mic className="w-4 h-4" />
          </button>
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
            placeholder="输入护理需求，或点麦克风语音输入..."
            rows={1}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="发送"
            type="button"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          AI 回复仅供护理参考，不构成医疗诊断建议；护理记录和任务请核对后再保存。
        </p>
      </div>
    </div>
  );
}
