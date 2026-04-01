import { LoadingCard } from "@/components/loading-card";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <LoadingCard className="h-[22rem]" />
      <div className="grid gap-6 lg:grid-cols-3">
        <LoadingCard className="h-80" />
        <LoadingCard className="h-80" />
        <LoadingCard className="h-80" />
      </div>
    </div>
  );
}
