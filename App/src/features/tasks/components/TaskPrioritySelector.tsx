import type { CareTaskPriority } from "@/entities/care-task/model";

interface TaskPrioritySelectorProps {
  options: Array<{ value: CareTaskPriority; label: string }>;
  value: CareTaskPriority;
  onChange: (value: CareTaskPriority) => void;
}

function getPriorityButtonClass(
  option: CareTaskPriority,
  selectedValue: CareTaskPriority,
) {
  if (selectedValue !== option) {
    return "border-muted bg-muted/10 text-muted-foreground";
  }

  switch (option) {
    case "high":
      return "border-accent bg-accent/10 text-accent";
    case "normal":
      return "border-primary bg-primary/10 text-primary";
    case "low":
    default:
      return "border-chart-2 bg-chart-2/10 text-chart-2";
  }
}

export function TaskPrioritySelector({
  options,
  value,
  onChange,
}: TaskPrioritySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded-xl border py-3 text-sm font-medium transition-colors ${getPriorityButtonClass(
            option.value,
            value,
          )}`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
