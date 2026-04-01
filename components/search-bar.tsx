"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Movie } from "@/lib/types";

export function SearchBar({
  movies,
  title = "Find a major release",
  subtitle = "Search Hollywood, Bollywood, Telugu, and Tamil theatrical titles",
  compact = false
}: {
  movies: Movie[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return movies.slice(0, compact ? 5 : 6);
    return movies
      .filter((movie) =>
        `${movie.title} ${movie.language} ${movie.industry}`.toLowerCase().includes(query.trim().toLowerCase())
      )
      .slice(0, 6);
  }, [compact, query]);

  return (
    <div className="rounded-[32px] border border-black/5 bg-white/86 p-5 shadow-panel sm:p-7">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.32em] text-ember">{title}</p>
        <p className="mt-2 text-sm leading-6 text-ink/65">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 rounded-[20px] border border-black/10 bg-mist px-4 py-3.5">
        <Search className="h-4 w-4 text-ink/45" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-ink/35"
          placeholder="Search by movie, language, or industry"
        />
      </div>
      <div className="mt-4 grid gap-2">
        {results.length > 0 ? (
          results.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.slug}`}
              className="flex items-center justify-between rounded-2xl border border-transparent bg-[#f7f4ee] px-4 py-3 transition hover:border-black/5 hover:bg-white"
            >
              <div>
                <p className="font-medium text-ink">{movie.title}</p>
                <p className="text-sm text-ink/55">
                  {movie.language} • {movie.industry}
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.26em] text-ink/42">Open</span>
            </Link>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-[#f7f4ee] px-4 py-5">
            <p className="text-sm font-medium text-ink">No matching releases</p>
            <p className="mt-1 text-sm leading-6 text-ink/58">Try a movie title, language, or industry name from the current catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
