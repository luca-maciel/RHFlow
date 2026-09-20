import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  children: ReactNode;
};

export default function DashboardCard({
  title,
  children,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-app-border bg-surface p-5">
      <h2 className="mb-5 text-sm font-semibold text-foreground">
        {title}
      </h2>

      {children}
    </div>
  );
}