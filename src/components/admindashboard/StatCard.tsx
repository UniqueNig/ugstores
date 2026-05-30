import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  change?: number; // e.g. 12.5 means +12.5%
  icon: LucideIcon;
  prefix?: string;
};

export default function StatCard({ label, value, change, icon: Icon, prefix }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p
          className="text-[10px] tracking-[0.2em] uppercase font-bold font-['DM_Sans']"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          className="text-3xl font-black font-['Playfair_Display']"
          style={{ color: "var(--text-primary)" }}
        >
          {prefix}{value}
        </p>
      </div>

      {/* Change */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={13} color="#22c55e" />
          ) : (
            <TrendingDown size={13} color="#ef4444" />
          )}
          <span
            className="text-xs font-bold font-['DM_Sans']"
            style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
          >
            {isPositive ? "+" : ""}{change}%
          </span>
          <span
            className="text-xs font-['DM_Sans']"
            style={{ color: "var(--text-muted)" }}
          >
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}