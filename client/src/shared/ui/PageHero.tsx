import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  actions,
  children,
  className,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-primary to-primary/80 text-white px-6 pt-12 pb-6 rounded-b-[2rem]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          {subtitle ? <p className="text-white/70 text-sm">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
