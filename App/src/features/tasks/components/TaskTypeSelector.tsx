import type { CareTaskType } from "@/entities/care-task/model";

interface TaskTypeSelectorProps {
  options: Array<{ value: CareTaskType; label: string }>;
  value: CareTaskType | "";
  onChange: (value: CareTaskType) => void;
}

export function TaskTypeSelector({
  options,
  value,
  onChange,
}: TaskTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
            value === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-muted/30 text-foreground/70 hover:bg-muted/50"
          }`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
