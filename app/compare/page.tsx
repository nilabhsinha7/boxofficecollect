import { AskAiCard } from "@/components/ask-ai-card";
import { CompareChart } from "@/components/compare-chart";
import { ComparePicker } from "@/components/compare-picker";
import { PosterTile } from "@/components/poster-tile";
import { StatCard } from "@/components/stat-card";
import { getComparisonData, getFallbackComparisonSelection } from "@/lib/data/catalog";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const fallbackSelection = await getFallbackComparisonSelection();
  const movieAId = params.a ?? fallbackSelection.defaultA ?? "";
  const movieBId = params.b ?? fallbackSelection.defaultB ?? "";
  const comparison =
    (movieAId && movieBId ? await getComparisonData(movieAId, movieBId) : null) ??
    (fallbackSelection.defaultA && fallbackSelection.defaultB
      ? await getComparisonData(fallbackSelection.defaultA, fallbackSelection.defaultB)
      : null);

  if (!comparison) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-black/5 bg-white/82 p-8 text-center shadow-panel">
          <p className="text-xs uppercase tracking-[0.32em] text-ember">Compare</p>
          <h1 className="mt-4 font-display text-5xl leading-none text-ink">No comparison available.</h1>
          <p className="mt-4 text-base leading-7 text-ink/62">
            Choose two titles from the current catalog to compare daily pace and cumulative performance.
          </p>
          <div className="mt-8">
            <ComparePicker
              movies={fallbackSelection.movies}
              defaultA={fallbackSelection.defaultA}
              defaultB={fallbackSelection.defaultB}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[32px] border border-black/5 bg-[#f8f4ec] p-6 shadow-panel sm:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-ember">Head-to-head tracking</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">Compare two box office runs side by side.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/68 sm:text-lg sm:leading-8">
            View relative daily momentum, cumulative scale, and a short structured comparison summary. This is aligned to theatrical run day, not just calendar date.
          </p>
          <div className="mt-8">
            <ComparePicker
              movies={fallbackSelection.movies}
              defaultA={comparison.movieA.movie.id}
              defaultB={comparison.movieB.movie.id}
            />
          </div>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <PosterTile movie={comparison.movieA.movie} className="min-h-[18rem]" />
            <PosterTile movie={comparison.movieB.movie} className="min-h-[18rem]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatCard label={comparison.movieA.movie.title} value={formatCompactCurrency(comparison.movieA.totals.worldwideGross)} hint="Worldwide total" compact />
            <StatCard label={comparison.movieB.movie.title} value={formatCompactCurrency(comparison.movieB.totals.worldwideGross)} hint="Worldwide total" compact tone="soft" />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-ember">{comparison.movieA.movie.title}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Worldwide" value={formatCompactCurrency(comparison.movieA.totals.worldwideGross)} compact />
            <StatCard label="Latest update" value={formatDate(comparison.movieA.totals.updatedAt)} tone="soft" compact />
          </div>
          <p className="mt-5 text-base leading-7 text-ink/72">{comparison.movieA.aiSummary}</p>
        </div>
        <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-sage">{comparison.movieB.movie.title}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="Worldwide" value={formatCompactCurrency(comparison.movieB.totals.worldwideGross)} compact />
            <StatCard label="Latest update" value={formatDate(comparison.movieB.totals.updatedAt)} tone="soft" compact />
          </div>
          <p className="mt-5 text-base leading-7 text-ink/72">{comparison.movieB.aiSummary}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-6">
        <CompareChart left={comparison.movieA} right={comparison.movieB} metricType="daily" title="Daily gross comparison" />
        <CompareChart left={comparison.movieA} right={comparison.movieB} metricType="cumulative" title="Cumulative gross comparison" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[30px] border border-black/5 bg-white/84 p-6 shadow-panel sm:p-7">
          <p className="text-xs uppercase tracking-[0.32em] text-ember">AI comparison summary</p>
          <p className="mt-4 text-base leading-7 text-ink/78 sm:text-lg sm:leading-8">{comparison.summary}</p>
        </div>
        <AskAiCard
          title="Ask which film has the healthier trajectory"
          prompt={`Compare the long-tail prospects of ${comparison.movieA.movie.title} and ${comparison.movieB.movie.title} based on their daily and cumulative curves.`}
        />
      </section>
    </div>
  );
}
