import Link from "next/link";
import { MovieMover } from "@/lib/types";
import { formatCompactCurrency } from "@/lib/utils";

export function MoversList({ movers }: { movers: MovieMover[] }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-ember">Latest movers</p>
      <p className="mt-2 text-sm leading-6 text-ink/58">Daily pace shifts worth watching right now.</p>
      <div className="mt-5 space-y-3">
        {movers.length > 0 ? movers.map((item) => (
          <Link
            key={item.movie.id}
            href={`/movies/${item.movie.slug}`}
            className="flex items-center justify-between gap-4 rounded-2xl bg-[#f7f4ee] px-4 py-4 transition hover:bg-mist"
          >
            <div>
              <p className="font-medium text-ink">{item.movie.title}</p>
              <p className="mt-1 text-sm text-ink/56">Latest daily gross {formatCompactCurrency(item.latest)}</p>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${
                item.delta >= 0 ? "bg-sage/14 text-sage" : "bg-ember/14 text-ember"
              }`}
            >
              {item.delta >= 0 ? "+" : ""}
              {item.delta}%
            </div>
          </Link>
        )) : (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-[#f7f4ee] px-4 py-5">
            <p className="text-sm font-medium text-ink">No mover data available</p>
            <p className="mt-1 text-sm leading-6 text-ink/58">Latest daily movement will appear here once snapshot data is available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
