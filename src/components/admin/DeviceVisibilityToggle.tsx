import { Monitor, Smartphone, type LucideIcon } from "lucide-react";
import type { DeviceVisibility } from "@/lib/site-section-visibility.functions";

const OPTIONS: { key: DeviceVisibility; label: string; icon?: LucideIcon }[] = [
  { key: "both", label: "Both" },
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "mobile", label: "Mobile", icon: Smartphone },
];

export function DeviceVisibilityToggle({
  value,
  onChange,
}: {
  value: DeviceVisibility;
  onChange: (v: DeviceVisibility) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            value === opt.key ? "bg-[#3B82F6]/20 text-white" : "text-white/50 hover:text-white"
          }`}
        >
          {opt.icon && <opt.icon className="h-3 w-3" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
