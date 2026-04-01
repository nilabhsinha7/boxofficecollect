export function LoadingCard({
  className = "h-40"
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-[28px] border border-black/5 bg-white/70 ${className}`} />;
}
