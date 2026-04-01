import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { getMovieByIdData } from "@/lib/data/catalog";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatCompactCurrency, formatDate } from "@/lib/utils";
import {
  importMovieTotalsCsvAction,
  importSnapshotsCsvAction,
  updateMovieTotalsAction,
  upsertSnapshotAction
} from "@/app/internal/actions";

export const dynamic = "force-dynamic";

type InternalMovieOption = {
  id: string;
  slug: string;
  title: string;
};

async function getInternalMovieOptions() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("movies").select("id, slug, title").order("title");
  if (error || !data) return [];

  return data as InternalMovieOption[];
}

export default async function InternalPage({
  searchParams
}: {
  searchParams: Promise<{ movieId?: string; status?: string; message?: string }>;
}) {
  const params = await searchParams;
  const movies = await getInternalMovieOptions();
  const selectedMovieId = params.movieId ?? movies[0]?.id ?? "";
  const selected = selectedMovieId ? await getMovieByIdData(selectedMovieId) : null;
  const { serviceRoleKey } = getSupabaseConfig();
  const hasWriteAccess = Boolean(serviceRoleKey);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="rounded-[32px] border border-black/5 bg-white/84 p-6 shadow-panel sm:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-ember">Internal manual updates</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] text-ink sm:text-6xl">Maintain live BoxOfficeCollect records.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink/66">
          This route is intentionally simple and internal-facing. Use it to adjust movie totals and upsert canonical daily or cumulative snapshots directly in Supabase.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Route" value="/internal" hint="Unlinked internal maintenance path" compact />
          <StatCard label="Write mode" value={hasWriteAccess ? "Enabled" : "Missing env"} hint="Requires service role key on server" compact tone="soft" />
          <StatCard label="Movies in DB" value={`${movies.length}`} hint="Selection list comes from live Supabase records" compact tone="accent" />
        </div>
      </section>

      {params.message ? (
        <div
          className={`mt-6 rounded-[24px] border px-5 py-4 shadow-panel ${
            params.status === "success"
              ? "border-sage/20 bg-[#f3f7f4] text-sage"
              : "border-ember/20 bg-[#faf2ec] text-ember"
          }`}
        >
          <p className="text-sm font-medium">{params.message}</p>
        </div>
      ) : null}

      {!hasWriteAccess ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-black/10 bg-[#f7f4ee] p-6">
          <p className="text-base font-medium text-ink">Server-side write access is not configured.</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env</code> before using this internal write path.
          </p>
        </div>
      ) : null}

      {movies.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-black/10 bg-[#f7f4ee] p-6">
          <p className="text-base font-medium text-ink">No live movies found in Supabase.</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Run `npm run import:seed` first, then return here to update totals or add snapshots manually.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-ember">Import totals CSV</p>
              <p className="mt-2 text-sm leading-6 text-ink/58">
                Bulk upsert `movie_totals` rows by movie slug. Existing movies are required.
              </p>
              <form action={importMovieTotalsCsvAction} className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-ink/62">CSV file</span>
                  <input
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                  />
                </label>
                <div className="rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm leading-6 text-ink/62">
                  Required headers: <code>slug</code>, <code>domestic_gross</code>, <code>overseas_gross</code>, <code>worldwide_gross</code>,{" "}
                  <code>india_net</code>, <code>india_gross</code>
                </div>
                <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Import totals CSV</button>
              </form>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-ember">Import snapshots CSV</p>
              <p className="mt-2 text-sm leading-6 text-ink/58">
                Bulk upsert canonical snapshot rows by movie slug, date, territory, and metric type.
              </p>
              <form action={importSnapshotsCsvAction} className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-ink/62">CSV file</span>
                  <input
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                  />
                </label>
                <div className="rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm leading-6 text-ink/62">
                  Required headers: <code>slug</code>, <code>date</code>, <code>territory</code>, <code>metric_type</code>, <code>amount</code>,{" "}
                  <code>currency</code>, <code>source_name</code>, <code>confidence_score</code>
                  <br />
                  Optional headers: <code>source_url</code>, <code>is_verified</code>
                </div>
                <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Import snapshots CSV</button>
              </form>
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
            <form action="/internal" className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm text-ink/62">Selected movie</span>
                <select
                  name="movieId"
                  defaultValue={selectedMovieId}
                  className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                >
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Load movie</button>
            </form>
          </section>

          {selected ? (
            <section className="mt-6 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-ember">Current record</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{selected.movie.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/58">
                    {selected.movie.language} • {selected.movie.industry} • {formatDate(selected.movie.releaseDate)}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <StatCard label="Worldwide" value={formatCompactCurrency(selected.totals.worldwideGross)} compact />
                    <StatCard label="Latest update" value={formatDate(selected.totals.updatedAt)} compact tone="soft" />
                  </div>
                  <div className="mt-5">
                    <Link
                      href={`/movies/${selected.movie.slug}`}
                      className="inline-flex rounded-full bg-[#f7f4ee] px-4 py-2 text-sm font-medium text-ink"
                    >
                      Open public movie page
                    </Link>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-ember">Update totals</p>
                  <form action={updateMovieTotalsAction} className="mt-5 grid gap-4">
                    <input type="hidden" name="movieId" value={selected.movie.id} />
                    <input type="hidden" name="movieSlug" value={selected.movie.slug} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink/62">Domestic gross</span>
                        <input
                          name="domesticGross"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={selected.totals.domesticGross}
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink/62">Overseas gross</span>
                        <input
                          name="overseasGross"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={selected.totals.overseasGross}
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink/62">Worldwide gross</span>
                        <input
                          name="worldwideGross"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={selected.totals.worldwideGross}
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink/62">India net</span>
                        <input
                          name="indiaNet"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={selected.totals.indiaNet}
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm text-ink/62">India gross</span>
                        <input
                          name="indiaGross"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={selected.totals.indiaGross}
                          className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                        />
                      </label>
                    </div>
                    <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Save totals</button>
                  </form>
                </div>
              </div>

              <div className="rounded-[28px] border border-black/5 bg-white/82 p-5 shadow-panel sm:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-ember">Upsert snapshot</p>
                <p className="mt-2 text-sm leading-6 text-ink/58">
                  This respects the canonical uniqueness rule: one row per movie, date, territory, and metric type.
                </p>
                <form action={upsertSnapshotAction} className="mt-5 grid gap-4">
                  <input type="hidden" name="movieId" value={selected.movie.id} />
                  <input type="hidden" name="movieSlug" value={selected.movie.slug} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Date</span>
                      <input
                        name="date"
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Territory</span>
                      <input
                        name="territory"
                        defaultValue="worldwide"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Metric type</span>
                      <select
                        name="metricType"
                        defaultValue="daily"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      >
                        <option value="daily">Daily</option>
                        <option value="cumulative">Cumulative</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Amount</span>
                      <input
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Currency</span>
                      <input
                        name="currency"
                        defaultValue="USD"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-ink/62">Confidence score</span>
                      <input
                        name="confidenceScore"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue="0.95"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm text-ink/62">Source name</span>
                      <input
                        name="sourceName"
                        defaultValue="Manual Update"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm text-ink/62">Source URL</span>
                      <input
                        name="sourceUrl"
                        placeholder="Optional"
                        className="w-full rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm outline-none"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl bg-[#f7f4ee] px-4 py-3 text-sm text-ink/70">
                    <input name="isVerified" type="checkbox" className="h-4 w-4" />
                    Mark this snapshot as verified
                  </label>
                  <button className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Upsert snapshot</button>
                </form>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
