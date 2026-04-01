import { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

const palette: Record<Movie["industry"], string> = {
  Hollywood: "from-[#0f2236] via-[#1f4966] to-[#d3aa53]",
  Bollywood: "from-[#3b1020] via-[#8e3451] to-[#f2a65a]",
  Telugu: "from-[#102c25] via-[#2a6d59] to-[#d1b85d]",
  Tamil: "from-[#26153c] via-[#5b3985] to-[#e68e5c]"
};

export function PosterTile({
  movie,
  className
}: {
  movie: Movie;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/30 bg-gradient-to-br p-5 text-white shadow-panel",
        palette[movie.industry],
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_35%)]" />
      <div className="relative flex h-full min-h-56 flex-col justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">{movie.industry}</p>
          <p className="mt-3 max-w-[11rem] font-display text-4xl leading-[0.9]">{movie.title}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/65">{movie.language}</p>
          <p className="mt-2 text-xs text-white/70">BoxOfficeCollect demo poster card</p>
        </div>
      </div>
    </div>
  );
}
