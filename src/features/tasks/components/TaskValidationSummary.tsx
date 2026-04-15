interface TaskValidationSummaryProps {
  messages: string[];
}

export function TaskValidationSummary({
  messages,
}: TaskValidationSummaryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
      <p className="mb-2 text-sm font-medium text-accent">提交前请先补齐以下内容</p>
      <div className="space-y-1">
        {messages.map((message) => (
          <p key={message} className="text-xs text-foreground/75">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
