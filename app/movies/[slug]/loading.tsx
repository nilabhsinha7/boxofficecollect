import { LoadingCard } from "@/components/loading-card";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr]">
        <LoadingCard className="h-[32rem]" />
        <LoadingCard className="h-[32rem]" />
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <LoadingCard className="h-80" />
        <LoadingCard className="h-80" />
      </div>
    </div>
  );
}
