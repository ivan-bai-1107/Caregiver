interface RecordValidationSummaryProps {
  messages: string[];
}

export function RecordValidationSummary({ messages }: RecordValidationSummaryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
      <p className="text-sm font-medium text-accent mb-2">提交前请先补齐以下内容</p>
      <div className="space-y-1">
        {messages.map((message) => (
          <p key={message} className="text-xs text-foreground/75">
            • {message}
          </p>
        ))}
      </div>
    </div>
  );
}
