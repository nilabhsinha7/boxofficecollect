import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { boxOfficeSnapshots, movieTotals, movies } from "../lib/data/movies";

type MovieInsert = {
  slug: string;
  title: string;
  original_title: string | null;
  release_date: string;
  language: string;
  industry: string;
  poster_url: string | null;
  synopsis: string | null;
  status: string;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const movieRows: MovieInsert[] = movies.map((movie) => ({
    slug: movie.slug,
    title: movie.title,
    original_title: movie.originalTitle ?? null,
    release_date: movie.releaseDate,
    language: movie.language,
    industry: movie.industry,
    poster_url: movie.posterUrl ?? null,
    synopsis: movie.synopsis ?? null,
    status: movie.status
  }));

  const { error: movieUpsertError } = await supabase.from("movies").upsert(movieRows, {
    onConflict: "slug"
  });

  if (movieUpsertError) throw movieUpsertError;

  const { data: insertedMovies, error: insertedMoviesError } = await supabase
    .from("movies")
    .select("id, slug")
    .in(
      "slug",
      movies.map((movie) => movie.slug)
    );

  if (insertedMoviesError) throw insertedMoviesError;
  if (!insertedMovies || insertedMovies.length !== movies.length) {
    throw new Error("Could not resolve all imported movie ids from Supabase.");
  }

  const dbMovieIdBySlug = new Map(insertedMovies.map((row) => [row.slug, row.id]));
  const dbMovieIdBySeedId = new Map(
    movies.map((movie) => {
      const dbId = dbMovieIdBySlug.get(movie.slug);
      if (!dbId) throw new Error(`Missing database id for ${movie.slug}`);
      return [movie.id, dbId];
    })
  );

  const totalsRows = movieTotals.map((totals) => {
    const dbMovieId = dbMovieIdBySeedId.get(totals.movieId);
    if (!dbMovieId) throw new Error(`Missing mapped movie id for totals ${totals.movieId}`);

    return {
      movie_id: dbMovieId,
      domestic_gross: totals.domesticGross,
      overseas_gross: totals.overseasGross,
      worldwide_gross: totals.worldwideGross,
      india_net: totals.indiaNet,
      india_gross: totals.indiaGross,
      updated_at: totals.updatedAt
    };
  });

  const { error: totalsUpsertError } = await supabase.from("movie_totals").upsert(totalsRows, {
    onConflict: "movie_id"
  });

  if (totalsUpsertError) throw totalsUpsertError;

  const snapshotRows = boxOfficeSnapshots.map((snapshot) => {
    const dbMovieId = dbMovieIdBySeedId.get(snapshot.movieId);
    if (!dbMovieId) throw new Error(`Missing mapped movie id for snapshot ${snapshot.id}`);

    return {
      movie_id: dbMovieId,
      date: snapshot.date,
      territory: snapshot.territory,
      metric_type: snapshot.metricType,
      amount: snapshot.amount,
      currency: snapshot.currency,
      source_name: snapshot.sourceName,
      source_url: snapshot.sourceUrl ?? null,
      confidence_score: snapshot.confidenceScore,
      is_verified: snapshot.isVerified
    };
  });

  const { error: snapshotsUpsertError } = await supabase.from("box_office_snapshots").upsert(snapshotRows, {
    onConflict: "movie_id,date,territory,metric_type"
  });

  if (snapshotsUpsertError) throw snapshotsUpsertError;

  console.log("Seed import complete.");
  console.log(`Movies upserted: ${movieRows.length}`);
  console.log(`Movie totals upserted: ${totalsRows.length}`);
  console.log(`Snapshots upserted: ${snapshotRows.length}`);
}

main().catch((error) => {
  console.error("Seed import failed.");
  console.error(error);
  process.exit(1);
});
