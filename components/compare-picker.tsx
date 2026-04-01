"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Movie } from "@/lib/types";

export function ComparePicker({
  movies,
  defaultA,
  defaultB
}: {
  movies: Movie[];
  defaultA?: string;
  defaultB?: string;
}) {
  const router = useRouter();
  const [movieA, setMovieA] = useState(defaultA ?? movies[0]?.id ?? "");
  const [movieB, setMovieB] = useState(defaultB ?? movies[1]?.id ?? "");

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/84 p-5 shadow-panel sm:p-6">
      <p className="text-xs uppercase tracking-[0.32em] text-ember">Compare two titles</p>
      <p className="mt-2 text-sm leading-6 text-ink/58">Choose two releases and compare their run shape instantly.</p>
      {movies.length === 0 ? (
        <div className="mt-5 rounded-[22px] border border-dashed border-black/10 bg-[#f7f4ee] px-4 py-5">
          <p className="text-sm font-medium text-ink">No titles available to compare</p>
          <p className="mt-1 text-sm leading-6 text-ink/58">Add movie records to Supabase or use the seeded fallback dataset.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm text-ink/62">Movie A</span>
            <select
              value={movieA}
              onChange={(event) => setMovieA(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
            >
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-ink/62">Movie B</span>
            <select
              value={movieB}
              onChange={(event) => setMovieB(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
            >
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => router.push(`/compare?a=${movieA}&b=${movieB}`)}
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 lg:mb-[1px]"
          >
            Compare now
          </button>
        </div>
      )}
    </div>
  );
}
