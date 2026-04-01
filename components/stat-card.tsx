import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  compact = false
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "soft";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border shadow-panel",
        compact ? "p-4" : "p-5",
        tone === "accent" && "border-ember/15 bg-[#faf2ec]",
        tone === "soft" && "border-sage/15 bg-[#f3f7f4]",
        tone === "default" && "border-black/5 bg-white/82"
      )}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-ink/55">{label}</p>
      <p className={cn("font-semibold tracking-tight text-ink", compact ? "mt-3 text-2xl" : "mt-4 text-3xl")}>{value}</p>
      {hint ? <p className={cn("text-ink/62", compact ? "mt-2 text-xs leading-5" : "mt-2 text-sm leading-6")}>{hint}</p> : null}
    </div>
  );
}
