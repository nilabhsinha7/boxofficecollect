import Link from "next/link";
import { PosterTile } from "@/components/poster-tile";
import { Movie, MovieTotals } from "@/lib/types";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export function MovieCard({ movie, totals }: { movie: Movie; totals: MovieTotals }) {
  return (
    <Link
      href={`/movies/${movie.slug}`}
      className="group rounded-[28px] border border-black/5 bg-white/78 p-3 shadow-panel transition hover:-translate-y-1 hover:bg-white sm:p-4"
    >
      <PosterTile movie={movie} className="min-h-56 sm:min-h-64" />
      <div className="px-1 pb-2 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">{movie.title}</h3>
            <p className="mt-1 text-sm text-ink/58">
              {movie.language} • {formatDate(movie.releaseDate)}
            </p>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-ink/60">
            {movie.industry}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
          <span className="text-ink/55">Worldwide</span>
          <span className="font-semibold text-ink">{formatCompactCurrency(totals.worldwideGross)}</span>
        </div>
      </div>
    </Link>
  );
}
