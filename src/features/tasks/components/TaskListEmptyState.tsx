import { CheckCircle2 } from "lucide-react";

interface TaskListEmptyStateProps {
  title: string;
  description: string;
}

export function TaskListEmptyState({
  title,
  description,
}: TaskListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <CheckCircle2 className="h-12 w-12 text-muted-foreground/30" />
      <p className="text-sm text-foreground/75">{title}</p>
      <p className="max-w-xs text-center text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
