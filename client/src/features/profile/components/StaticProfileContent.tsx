import type { LucideIcon } from "lucide-react";

interface StaticProfileContentProps {
  icon: LucideIcon;
  content: string;
}

export function StaticProfileContent({ icon: Icon, content }: StaticProfileContentProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
