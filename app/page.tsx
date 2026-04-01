import Link from "next/link";
import { AskAiCard } from "@/components/ask-ai-card";
import { ComparePicker } from "@/components/compare-picker";
import { MoversList } from "@/components/movers-list";
import { MovieCard } from "@/components/movie-card";
import { SearchBar } from "@/components/search-bar";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { getHomePageData } from "@/lib/data/catalog";
import { formatCompactCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { allMovies, featured, totalTracked, trending, movers } = await getHomePageData();
  const leadMovie = trending[0];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 py-8 sm:px-6 lg:px-8 lg:gap-20 lg:py-12">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="rounded-[36px] border border-black/5 bg-hero-glow bg-[#f8f4ec] p-7 shadow-panel sm:p-10">
          <p className="text-xs uppercase tracking-[0.34em] text-ember">Focused theatrical intelligence</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
            Track the box office without the noise.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/68 sm:text-lg sm:leading-8">
            BoxOfficeCollect is a premium-feeling tracker for major theatrical releases. Search titles, follow daily and cumulative
            performance, compare two films side by side, and prepare for structured AI insights on box office trends.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard label="Tracked releases" value={`${allMovies.length}`} hint="Current available catalog" compact />
            <StatCard label="Worldwide tracked" value={formatCompactCurrency(totalTracked)} hint="Across current sample dataset" tone="accent" compact />
            <StatCard label="Coverage" value="US + India" hint="Hollywood plus India" tone="soft" compact />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compare" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90">
              Start comparing
            </Link>
            {leadMovie ? (
              <Link
                href={`/movies/${leadMovie.movie.slug}`}
                className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium text-ink transition hover:bg-white"
              >
                Open a sample title
              </Link>
            ) : null}
          </div>
        </div>
        <div className="grid gap-6">
          <SearchBar
            movies={allMovies}
            title="Search major releases"
            subtitle="Find a film fast and jump directly into daily gross, cumulative pace, and side-by-side comparison."
          />
          {leadMovie ? (
            <div className="rounded-[32px] border border-black/5 bg-white/82 p-6 shadow-panel">
              <p className="text-xs uppercase tracking-[0.32em] text-ember">Current standout</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{leadMovie.movie.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/58">
                {leadMovie.movie.language} • {leadMovie.movie.industry} • {formatCompactCurrency(leadMovie.totals.worldwideGross)} worldwide
              </p>
              <p className="mt-4 text-sm leading-6 text-ink/65">
                The current homepage focus is search-first, with a quick jump into the strongest active theatrical performer in the seeded set.
              </p>
              <Link href={`/movies/${leadMovie.movie.slug}`} className="mt-5 inline-flex rounded-full bg-[#f7f4ee] px-4 py-2 text-sm font-medium text-ink">
                View movie details
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Trending releases"
            title="A compact market view of current theatrical momentum"
            copy="Designed like a focused dashboard: fewer decisions, clearer signal, and a fast path to detail or comparison."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trending.map((entry) => (
              <MovieCard key={entry.movie.id} movie={entry.movie} totals={entry.totals} />
            ))}
          </div>
        </div>
        <MoversList movers={movers} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <AskAiCard
          title="Comparison will be the standout workflow"
          prompt="Which title has the healthier pace after opening weekend: Avatar: Fire and Ash or Inside Out 3?"
        />
        <ComparePicker movies={allMovies} defaultA={featured[0]?.movie.id} defaultB={featured[1]?.movie.id} />
      </section>
    </div>
  );
}
