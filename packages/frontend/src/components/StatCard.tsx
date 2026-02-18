import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}

export function StatCard({ icon, value, label, highlight }: StatCardProps) {
  return (
    <div className={`stat-card${highlight ? " highlight" : ""}`}>
      {icon}
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
