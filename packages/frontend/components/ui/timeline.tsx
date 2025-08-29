import * as React from "react";

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <ol className={`relative border-l border-muted ${className || ""}`}>
      {children}
    </ol>
  );
}

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return (
    <li className={`mb-6 ml-6 ${className || ""}`}>
      <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
      </span>
      {children}
    </li>
  );
}