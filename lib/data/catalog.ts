import { cache } from "react";
import {
  boxOfficeSnapshots as seededSnapshots,
  comparisonCache as seededComparisons,
  getComparison as getSeedComparison,
  getMovieBySlug as getSeedMovieBySlug,
  movieTotals as seededTotals,
  movies as seededMovies
} from "@/lib/data/movies";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ComparisonCache,
  FeaturedMovie,
  Movie,
  MovieComparison,
  MovieMover,
  MovieTotals,
  MovieWithTotals,
  Snapshot
} from "@/lib/types";
import { ensureComparisonSummary } from "@/lib/ai/compare-summary";

type MovieRow = {
  id: string;
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

type MovieTotalsRow = {
  movie_id: string;
  domestic_gross: number | string;
  overseas_gross: number | string;
  worldwide_gross: number | string;
  india_net: number | string;
  india_gross: number | string;
  updated_at: string;
};

type SnapshotRow = {
  id: string;
  movie_id: string;
  date: string;
  territory: string;
  metric_type: string;
  amount: number | string;
  currency: string;
  source_name: string;
  source_url: string | null;
  confidence_score: number | string;
  is_verified: boolean;
};

type ComparisonRow = {
  movie_a_id: string;
  movie_b_id: string;
  summary: string;
  generated_at: string;
};

type CatalogBundle = {
  movies: Movie[];
  totals: MovieTotals[];
  snapshots: Snapshot[];
  comparisons: ComparisonCache[];
  source: "seed" | "supabase";
};

function coerceIndustry(value: string): Movie["industry"] {
  if (value === "Hollywood" || value === "Bollywood" || value === "Telugu" || value === "Tamil") {
    return value;
  }
  return "Hollywood";
}

function coerceStatus(value: string): Movie["status"] {
  if (value === "active" || value === "cooling" || value === "upcoming") {
    return value;
  }
  return "active";
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  return Number(value ?? 0);
}

function mapMovieRow(row: MovieRow): Movie {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    originalTitle: row.original_title ?? undefined,
    releaseDate: row.release_date,
    language: row.language,
    industry: coerceIndustry(row.industry),
    posterUrl: row.poster_url ?? undefined,
    synopsis: row.synopsis ?? "",
    status: coerceStatus(row.status)
  };
}

function mapMovieTotalsRow(row: MovieTotalsRow): MovieTotals {
  return {
    movieId: row.movie_id,
    domesticGross: toNumber(row.domestic_gross),
    overseasGross: toNumber(row.overseas_gross),
    worldwideGross: toNumber(row.worldwide_gross),
    indiaNet: toNumber(row.india_net),
    indiaGross: toNumber(row.india_gross),
    updatedAt: row.updated_at
  };
}

function mapSnapshotRow(row: SnapshotRow): Snapshot {
  return {
    id: row.id,
    movieId: row.movie_id,
    date: row.date,
    territory: row.territory,
    metricType: row.metric_type === "cumulative" ? "cumulative" : "daily",
    amount: toNumber(row.amount),
    currency: row.currency,
    sourceName: row.source_name,
    sourceUrl: row.source_url ?? undefined,
    confidenceScore: toNumber(row.confidence_score),
    isVerified: row.is_verified
  };
}

function mapComparisonRow(row: ComparisonRow): ComparisonCache {
  return {
    movieAId: row.movie_a_id,
    movieBId: row.movie_b_id,
    summary: row.summary,
    generatedAt: row.generated_at
  };
}

function getSeedBundle(): CatalogBundle {
  return {
    movies: seededMovies,
    totals: seededTotals,
    snapshots: seededSnapshots,
    comparisons: seededComparisons,
    source: "seed"
  };
}

const getCatalogBundle = cache(async (): Promise<CatalogBundle> => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return getSeedBundle();

  try {
    const { data: movieRows, error: moviesError } = await supabase
      .from("movies")
      .select("*")
      .order("release_date", { ascending: false });

    if (moviesError) throw moviesError;
    if (!movieRows || movieRows.length === 0) return getSeedBundle();

    const movieIds = movieRows.map((row) => row.id);

    const [{ data: totalsRows, error: totalsError }, { data: snapshotRows, error: snapshotsError }, { data: comparisonRows, error: comparisonsError }] =
      await Promise.all([
        supabase.from("movie_totals").select("*").in("movie_id", movieIds),
        supabase.from("box_office_snapshots").select("*").in("movie_id", movieIds).order("date", { ascending: true }),
        supabase.from("comparisons_cache").select("*")
      ]);

    if (totalsError) throw totalsError;
    if (snapshotsError) throw snapshotsError;
    if (comparisonsError) throw comparisonsError;

    return {
      movies: movieRows.map(mapMovieRow),
      totals: (totalsRows ?? []).map(mapMovieTotalsRow),
      snapshots: (snapshotRows ?? []).map(mapSnapshotRow),
      comparisons: (comparisonRows ?? []).map(mapComparisonRow),
      source: "supabase"
    };
  } catch (error) {
    console.error("Supabase read failed, using seeded fallback.", error);
    return getSeedBundle();
  }
});

function buildFeaturedMovies(bundle: CatalogBundle): FeaturedMovie[] {
  return bundle.movies
    .map((movie) => {
      const totals = bundle.totals.find((entry) => entry.movieId === movie.id) ?? {
        movieId: movie.id,
        domesticGross: 0,
        overseasGross: 0,
        worldwideGross: 0,
        indiaNet: 0,
        indiaGross: 0,
        updatedAt: new Date().toISOString()
      };

      return { movie, totals };
    })
    .sort((a, b) => b.totals.worldwideGross - a.totals.worldwideGross);
}

function buildLatestMovers(bundle: CatalogBundle, limit = 5): MovieMover[] {
  return bundle.movies
    .map((movie) => {
      const snapshots = bundle.snapshots.filter(
        (entry) => entry.movieId === movie.id && entry.metricType === "daily" && entry.territory === "worldwide"
      );
      const latest = snapshots.at(-1);
      const previous = snapshots.at(-2);

      return {
        movie,
        latest: latest?.amount ?? 0,
        delta:
          latest && previous && previous.amount > 0
            ? Number((((latest.amount - previous.amount) / previous.amount) * 100).toFixed(1))
            : 0
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);
}

function getMovieSummary(movie: Movie) {
  const seeded = getSeedMovieBySlug(movie.slug);
  if (seeded) return seeded.aiSummary;

  return `${movie.title} is now flowing from the live BoxOfficeCollect dataset. Per-movie AI summaries remain placeholder copy until summary generation is wired in.`;
}

function buildMovieWithTotals(bundle: CatalogBundle, movie: Movie): MovieWithTotals {
  const totals = bundle.totals.find((entry) => entry.movieId === movie.id) ?? {
    movieId: movie.id,
    domesticGross: 0,
    overseasGross: 0,
    worldwideGross: 0,
    indiaNet: 0,
    indiaGross: 0,
    updatedAt: new Date().toISOString()
  };

  return {
    movie,
    totals,
    snapshots: bundle.snapshots.filter((entry) => entry.movieId === movie.id),
    aiSummary: getMovieSummary(movie)
  };
}

export async function getCatalogMovies() {
  const bundle = await getCatalogBundle();
  return bundle.movies;
}

export async function getHomePageData() {
  const bundle = await getCatalogBundle();
  const featured = buildFeaturedMovies(bundle);
  const trending = featured.slice(0, 6);
  const movers = buildLatestMovers(bundle);
  const totalTracked = featured.reduce((sum, item) => sum + item.totals.worldwideGross, 0);

  return {
    source: bundle.source,
    allMovies: bundle.movies,
    featured,
    trending,
    movers,
    totalTracked
  };
}

export async function getMovieBySlugData(slug: string) {
  const bundle = await getCatalogBundle();
  const movie = bundle.movies.find((entry) => entry.slug === slug);
  if (!movie) return null;
  return buildMovieWithTotals(bundle, movie);
}

export async function getMovieByIdData(id: string) {
  const bundle = await getCatalogBundle();
  const movie = bundle.movies.find((entry) => entry.id === id);
  if (!movie) return null;
  return buildMovieWithTotals(bundle, movie);
}

export async function getComparisonData(movieAId: string, movieBId: string): Promise<MovieComparison | null> {
  const bundle = await getCatalogBundle();
  const firstMovie = bundle.movies.find((entry) => entry.id === movieAId);
  const secondMovie = bundle.movies.find((entry) => entry.id === movieBId);
  if (!firstMovie || !secondMovie) return null;

  const movieA = buildMovieWithTotals(bundle, firstMovie);
  const movieB = buildMovieWithTotals(bundle, secondMovie);

  const cached =
    bundle.comparisons.find(
      (entry) =>
        (entry.movieAId === movieAId && entry.movieBId === movieBId) ||
        (entry.movieAId === movieBId && entry.movieBId === movieAId)
    )?.summary;

  const summary =
    (bundle.source === "supabase"
      ? await ensureComparisonSummary(
          {
            movieA,
            movieB,
            summary: ""
          },
          cached
        )
      : cached ?? getSeedComparison(movieAId, movieBId)?.summary) ??
    `${movieA.movie.title} is currently leaning more on ${movieA.movie.industry.toLowerCase()} momentum, while ${
      movieB.movie.title
    } has a steadier cumulative profile. The comparison is most meaningful in how each title sustains demand after opening weekend.`;

  return {
    movieA,
    movieB,
    summary
  };
}

export async function getFallbackComparisonSelection() {
  const bundle = await getCatalogBundle();
  const featured = buildFeaturedMovies(bundle);
  return {
    movies: bundle.movies,
    defaultA: featured[0]?.movie.id,
    defaultB: featured[1]?.movie.id
  };
}
