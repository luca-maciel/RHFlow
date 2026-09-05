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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-5 text-sm font-semibold text-slate-900">
        {title}
      </h2>

      {children}
    </div>
  );
}