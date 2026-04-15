import { Sparkles, ChevronRight } from "lucide-react";

interface HomeAiEntryCardProps {
  onOpen: () => void;
}

export function HomeAiEntryCard({ onOpen }: HomeAiEntryCardProps) {
  return (
    <button
      className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm"
      onClick={onOpen}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium">AI 护理助手</p>
          <p className="text-xs text-white/70">快速生成记录草稿、提醒草稿和护理建议</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-white/80" />
    </button>
  );
}
