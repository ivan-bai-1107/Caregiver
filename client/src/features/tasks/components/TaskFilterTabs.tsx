import type { TaskFilterTab, TaskListFilter } from "@/features/tasks/model";

interface TaskFilterTabsProps {
  tabs: TaskFilterTab[];
  activeFilter: TaskListFilter;
  onChange: (filter: TaskListFilter) => void;
}

export function TaskFilterTabs({
  tabs,
  activeFilter,
  onChange,
}: TaskFilterTabsProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm transition-colors ${
                activeFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground/60 hover:bg-muted"
              }`}
              onClick={() => onChange(tab.value)}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeFilter === tab.value ? "bg-white/20" : "bg-muted-foreground/20"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
