import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function SectionHeader({ title, action, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base">{title}</h2>
        {icon}
      </div>
      {action}
    </div>
  );
}
