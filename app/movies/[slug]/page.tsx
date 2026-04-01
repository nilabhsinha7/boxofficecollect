import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AskAiCard } from "@/components/ask-ai-card";
import { BoxOfficeChart } from "@/components/box-office-chart";
import { PosterTile } from "@/components/poster-tile";
import { StatCard } from "@/components/stat-card";
import { getMovieBySlugData } from "@/lib/data/catalog";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMovieBySlugData(slug);
  if (!data) return {};
  return {
    title: `${data.movie.title} | BoxOfficeCollect`,
    description: `Daily and cumulative box office performance for ${data.movie.title}.`
  };
}

export default async function MoviePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMovieBySlugData(slug);
  if (!data) notFound();

  const dailySnapshots = data.snapshots.filter((entry) => entry.metricType === "daily");
  const latestDaily = dailySnapshots.at(-1)?.amount ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <PosterTile movie={data.movie} className="min-h-[22rem] sm:min-h-[28rem] xl:min-h-[34rem]" />
        <div className="rounded-[32px] border border-black/5 bg-white/82 p-6 shadow-panel sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em]">
            <span className="rounded-full bg-[#faf2ec] px-3 py-1 text-ember">{data.movie.industry}</span>
            <span className="rounded-full bg-[#f7f4ee] px-3 py-1 text-ink/55">{data.movie.language}</span>
            <span className="rounded-full bg-[#f3f7f4] px-3 py-1 text-sage">{formatDate(data.movie.releaseDate)}</span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl">{data.movie.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/66">{data.movie.synopsis}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard label="Latest daily" value={formatCompactCurrency(latestDaily)} hint="Most recent worldwide daily snapshot" tone="accent" compact />
            <StatCard label="Worldwide total" value={formatCompactCurrency(data.totals.worldwideGross)} hint={`Updated ${formatDate(data.totals.updatedAt)}`} compact />
            <StatCard label="India gross" value={formatCompactCurrency(data.totals.indiaGross)} hint={`${data.movie.language} theatrical markets`} tone="soft" compact />
          </div>

          <div className="mt-6 rounded-[24px] bg-[#f7f4ee] p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Domestic</p>
                <p className="mt-2 text-lg font-medium text-ink">{formatCompactCurrency(data.totals.domesticGross)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Overseas</p>
                <p className="mt-2 text-lg font-medium text-ink">{formatCompactCurrency(data.totals.overseasGross)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">India net</p>
                <p className="mt-2 text-lg font-medium text-ink">{formatCompactCurrency(data.totals.indiaNet)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-ink/45">Status</p>
                <p className="mt-2 text-lg font-medium capitalize text-ink">{data.movie.status}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-black/5 bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">AI summary</p>
            <p className="mt-3 text-base leading-7 text-ink/76 sm:text-lg sm:leading-8">{data.aiSummary}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <BoxOfficeChart snapshots={data.snapshots} metricType="daily" color="#db6a3b" title="Daily gross trend" />
        <BoxOfficeChart snapshots={data.snapshots} metricType="cumulative" color="#5d7a68" title="Cumulative gross trend" />
      </section>

      <section className="mt-8">
        <AskAiCard
          title={`Ask why ${data.movie.title} is trending the way it is`}
          prompt={`What does the daily pace of ${data.movie.title} suggest about its second-week hold and final worldwide range?`}
        />
      </section>
    </div>
  );
}
