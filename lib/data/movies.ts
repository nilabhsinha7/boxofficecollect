import { ComparisonCache, Movie, MovieTotals, MovieWithTotals, Snapshot } from "@/lib/types";

const today = "2026-03-31";

const movieSeeds: Array<{
  movie: Movie;
  totals: Omit<MovieTotals, "updatedAt" | "movieId">;
  runDays: number;
  openingShare: number;
  sourceName: string;
  aiSummary: string;
}> = [
  {
    movie: {
      id: "m1",
      slug: "mission-impossible-final-reckoning",
      title: "Mission: Impossible - Final Reckoning",
      releaseDate: "2026-03-20",
      language: "English",
      industry: "Hollywood",
      synopsis: "Ethan Hunt races against a network-scale threat with premium-format business driving strong global attention.",
      status: "active"
    },
    totals: { domesticGross: 196000000, overseasGross: 284000000, worldwideGross: 480000000, indiaNet: 0, indiaGross: 13200000 },
    runDays: 12,
    openingShare: 0.16,
    sourceName: "Studio Estimates",
    aiSummary:
      "Premium screens and franchise familiarity are keeping this run sturdy, with weekday holds better than a typical late-stage action tentpole."
  },
  {
    movie: {
      id: "m2",
      slug: "avatar-fire-and-ash",
      title: "Avatar: Fire and Ash",
      releaseDate: "2026-03-07",
      language: "English",
      industry: "Hollywood",
      synopsis: "A large-format spectacle posting outsized overseas strength and unusually long legs in major markets.",
      status: "active"
    },
    totals: { domesticGross: 312000000, overseasGross: 612000000, worldwideGross: 924000000, indiaNet: 0, indiaGross: 27800000 },
    runDays: 25,
    openingShare: 0.11,
    sourceName: "Studio Estimates",
    aiSummary:
      "The film is behaving like a classic global-event release, with overseas momentum carrying the overall trajectory well above domestic pace."
  },
  {
    movie: {
      id: "m3",
      slug: "superman-legacy",
      title: "Superman: Legacy",
      releaseDate: "2026-03-14",
      language: "English",
      industry: "Hollywood",
      synopsis: "A broad-audience superhero launch leaning on family turnout and strong early domestic conversation.",
      status: "active"
    },
    totals: { domesticGross: 248000000, overseasGross: 205000000, worldwideGross: 453000000, indiaNet: 0, indiaGross: 9800000 },
    runDays: 18,
    openingShare: 0.14,
    sourceName: "Studio Estimates",
    aiSummary:
      "Domestic play is leading this campaign, and the day-to-day pace suggests the title is settling into a healthy mainstream run rather than a frontloaded one."
  },
  {
    movie: {
      id: "m4",
      slug: "dune-messiah",
      title: "Dune: Messiah",
      releaseDate: "2026-03-01",
      language: "English",
      industry: "Hollywood",
      synopsis: "A prestige-scale sci-fi sequel showing strong premium-format retention and mature audience stability.",
      status: "active"
    },
    totals: { domesticGross: 221000000, overseasGross: 337000000, worldwideGross: 558000000, indiaNet: 0, indiaGross: 14600000 },
    runDays: 30,
    openingShare: 0.1,
    sourceName: "Industry Tracker",
    aiSummary:
      "This run is being defined by retention, not just launch. Strong evening and premium attendance are helping it age gracefully."
  },
  {
    movie: {
      id: "m5",
      slug: "war-2",
      title: "War 2",
      releaseDate: "2026-03-21",
      language: "Hindi",
      industry: "Bollywood",
      synopsis: "A star-driven Hindi action release with huge opening demand and strong overseas support from diaspora markets.",
      status: "active"
    },
    totals: { domesticGross: 18200000, overseasGross: 21100000, worldwideGross: 65300000, indiaNet: 38400000, indiaGross: 44400000 },
    runDays: 11,
    openingShare: 0.2,
    sourceName: "Trade Aggregates",
    aiSummary:
      "The opening burst was massive, but the interesting story is that weekday erosion has stayed controlled enough to keep the lifetime outlook elevated."
  },
  {
    movie: {
      id: "m6",
      slug: "spirit",
      title: "Spirit",
      releaseDate: "2026-03-27",
      language: "Telugu",
      industry: "Telugu",
      synopsis: "A high-voltage Telugu action drama posting explosive opening numbers and premium occupancy in the Telugu states.",
      status: "active"
    },
    totals: { domesticGross: 9400000, overseasGross: 11800000, worldwideGross: 39800000, indiaNet: 22700000, indiaGross: 27900000 },
    runDays: 5,
    openingShare: 0.27,
    sourceName: "Trade Aggregates",
    aiSummary:
      "The first weekend set the pace here, and the current question is whether festival and mass-center demand can extend the run beyond the frontloaded phase."
  },
  {
    movie: {
      id: "m7",
      slug: "thug-life",
      title: "Thug Life",
      releaseDate: "2026-03-16",
      language: "Tamil",
      industry: "Tamil",
      synopsis: "A prestige Tamil event release combining city multiplexer strength with broad older-audience appeal.",
      status: "active"
    },
    totals: { domesticGross: 11200000, overseasGross: 15100000, worldwideGross: 41800000, indiaNet: 24100000, indiaGross: 30600000 },
    runDays: 15,
    openingShare: 0.18,
    sourceName: "Trade Aggregates",
    aiSummary:
      "Urban markets are disproportionately strong, which is giving the film a polished, premium curve even after the opening rush faded."
  },
  {
    movie: {
      id: "m8",
      slug: "coolie",
      title: "Coolie",
      releaseDate: "2026-02-28",
      language: "Tamil",
      industry: "Tamil",
      synopsis: "A crowd-pleasing mass entertainer with durable single-screen pull and solid dubbed-market spillover.",
      status: "cooling"
    },
    totals: { domesticGross: 7100000, overseasGross: 9200000, worldwideGross: 29400000, indiaNet: 17600000, indiaGross: 22300000 },
    runDays: 32,
    openingShare: 0.12,
    sourceName: "Trade Aggregates",
    aiSummary:
      "The film no longer has peak heat, but the hold pattern shows real mass-market staying power rather than a one-week phenomenon."
  },
  {
    movie: {
      id: "m9",
      slug: "housefull-5",
      title: "Housefull 5",
      releaseDate: "2026-03-08",
      language: "Hindi",
      industry: "Bollywood",
      synopsis: "A comedy ensemble relying on weekend family turnout and strong holiday playability.",
      status: "active"
    },
    totals: { domesticGross: 14200000, overseasGross: 9700000, worldwideGross: 41600000, indiaNet: 25700000, indiaGross: 31800000 },
    runDays: 24,
    openingShare: 0.13,
    sourceName: "Trade Aggregates",
    aiSummary:
      "Weekend jumps are doing the heavy lifting. The weekday base is softer, but the film remains commercially healthy thanks to broad family appeal."
  },
  {
    movie: {
      id: "m10",
      slug: "kgf-chapter-3",
      title: "KGF: Chapter 3",
      releaseDate: "2026-03-29",
      language: "Kannada",
      industry: "Bollywood",
      synopsis: "A pan-India action sequel with immediate nationwide traction and breakout early overseas business.",
      status: "active"
    },
    totals: { domesticGross: 16800000, overseasGross: 14300000, worldwideGross: 52400000, indiaNet: 29800000, indiaGross: 35600000 },
    runDays: 3,
    openingShare: 0.34,
    sourceName: "Trade Aggregates",
    aiSummary:
      "This is a classic event-film launch. The opening base is so large that even normal second-week drops would still imply a major final number."
  },
  {
    movie: {
      id: "m11",
      slug: "inside-out-3",
      title: "Inside Out 3",
      releaseDate: "2026-03-05",
      language: "English",
      industry: "Hollywood",
      synopsis: "A family animated hit with soft weekday drops and especially strong matinee business.",
      status: "active"
    },
    totals: { domesticGross: 274000000, overseasGross: 259000000, worldwideGross: 533000000, indiaNet: 0, indiaGross: 7400000 },
    runDays: 27,
    openingShare: 0.09,
    sourceName: "Studio Estimates",
    aiSummary:
      "The family audience is translating into one of the most stable day-by-day patterns in the current market, which is exactly what you want from this genre."
  },
  {
    movie: {
      id: "m12",
      slug: "leo-2",
      title: "Leo 2",
      releaseDate: "2026-03-11",
      language: "Tamil",
      industry: "Tamil",
      synopsis: "A sequel-powered Tamil action drama with huge initial fan demand and strong metro support.",
      status: "active"
    },
    totals: { domesticGross: 9800000, overseasGross: 13800000, worldwideGross: 38700000, indiaNet: 21900000, indiaGross: 24900000 },
    runDays: 21,
    openingShare: 0.17,
    sourceName: "Trade Aggregates",
    aiSummary:
      "The sequel factor sparked a very sharp start, but the current profile shows the run maturing into a solid, not runaway, blockbuster pace."
  },
  {
    movie: {
      id: "m13",
      slug: "salaar-part-2",
      title: "Salaar: Part 2",
      releaseDate: "2026-03-18",
      language: "Telugu",
      industry: "Telugu",
      synopsis: "A pan-India follow-up with heavy action appeal, dominant opening days, and healthy dubbed-market traction.",
      status: "active"
    },
    totals: { domesticGross: 12100000, overseasGross: 16200000, worldwideGross: 44600000, indiaNet: 25200000, indiaGross: 32500000 },
    runDays: 13,
    openingShare: 0.19,
    sourceName: "Trade Aggregates",
    aiSummary:
      "The movie opened like an event but is holding enough in key territories to suggest the fan-driven launch is broadening into real commercial traction."
  }
];

function buildDailySeries(total: number, days: number, openingShare: number) {
  const raw = Array.from({ length: days }, (_, index) => {
    const decay = Math.exp(-index / 5.2);
    const weekendBoost = index % 7 === 0 || index % 7 === 6 ? 1.16 : 0.94;
    const openingBoost = index === 0 ? openingShare * days * 0.75 : 1;
    return decay * weekendBoost * openingBoost;
  });

  const rawTotal = raw.reduce((sum, value) => sum + value, 0);
  const normalized = raw.map((value) => (value / rawTotal) * total);

  return normalized.map((amount, index) => ({
    day: index + 1,
    date: shiftDateByDays(today, -(days - 1 - index)),
    amount: Math.round(amount)
  }));
}

function shiftDateByDays(baseDate: string, delta: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

function makeSnapshots(movieId: string, total: number, runDays: number, openingShare: number, sourceName: string) {
  const dailySeries = buildDailySeries(total, runDays, openingShare);
  let cumulative = 0;

  return dailySeries.flatMap((point, index) => {
    cumulative += point.amount;

    const base = {
      movieId,
      date: point.date,
      currency: "USD",
      sourceName,
      sourceUrl: "https://example.com/source",
      confidenceScore: index < 2 ? 0.82 : 0.93,
      isVerified: index < runDays - 2
    };

    return [
      {
        id: `${movieId}-daily-${point.day}`,
        ...base,
        territory: "worldwide",
        metricType: "daily" as const,
        amount: point.amount
      },
      {
        id: `${movieId}-cumulative-${point.day}`,
        ...base,
        territory: "worldwide",
        metricType: "cumulative" as const,
        amount: cumulative
      }
    ];
  });
}

export const movies: Movie[] = movieSeeds.map((entry) => entry.movie);

export const movieTotals: MovieTotals[] = movieSeeds.map((entry) => ({
  movieId: entry.movie.id,
  updatedAt: today,
  ...entry.totals
}));

export const boxOfficeSnapshots: Snapshot[] = movieSeeds.flatMap((entry) =>
  makeSnapshots(entry.movie.id, entry.totals.worldwideGross, entry.runDays, entry.openingShare, entry.sourceName)
);

export const movieAiSummaries = Object.fromEntries(movieSeeds.map((entry) => [entry.movie.id, entry.aiSummary]));

export const comparisonCache: ComparisonCache[] = [
  {
    movieAId: "m2",
    movieBId: "m11",
    summary:
      "Avatar: Fire and Ash is winning on sheer global scale, while Inside Out 3 is delivering the steadier family-film hold pattern. One is powered by event status, the other by consistency.",
    generatedAt: today
  },
  {
    movieAId: "m5",
    movieBId: "m13",
    summary:
      "War 2 opened bigger in Hindi-heavy circuits, while Salaar: Part 2 is showing stronger spillover across dubbed and action-led territories.",
    generatedAt: today
  }
];

export function getMovieBySlug(slug: string) {
  const movie = movies.find((entry) => entry.slug === slug);
  if (!movie) return null;

  const totals = movieTotals.find((entry) => entry.movieId === movie.id);
  const snapshots = boxOfficeSnapshots.filter((entry) => entry.movieId === movie.id);
  if (!totals) return null;

  return {
    movie,
    totals,
    snapshots,
    aiSummary: movieAiSummaries[movie.id]
  } satisfies MovieWithTotals;
}

export function getMovieById(id: string) {
  const movie = movies.find((entry) => entry.id === id);
  return movie ? getMovieBySlug(movie.slug) : null;
}

export function getFeaturedMovies() {
  return movieTotals
    .map((totals) => {
      const movie = movies.find((entry) => entry.id === totals.movieId)!;
      return { movie, totals };
    })
    .sort((a, b) => b.totals.worldwideGross - a.totals.worldwideGross);
}

export function getTrendingMovies(limit = 6) {
  return getFeaturedMovies().slice(0, limit);
}

export function getLatestMovers(limit = 5) {
  return movies
    .map((movie) => {
      const snapshots = boxOfficeSnapshots.filter(
        (entry) => entry.movieId === movie.id && entry.metricType === "daily"
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

export function getComparison(movieAId: string, movieBId: string) {
  const first = getMovieById(movieAId);
  const second = getMovieById(movieBId);
  if (!first || !second) return null;

  const cached =
    comparisonCache.find(
      (entry) =>
        (entry.movieAId === movieAId && entry.movieBId === movieBId) ||
        (entry.movieAId === movieBId && entry.movieBId === movieAId)
    )?.summary ??
    `${first.movie.title} is currently leaning more on ${first.movie.industry.toLowerCase()} momentum, while ${
      second.movie.title
    } has a steadier cumulative profile. The comparison is most meaningful in how each title sustains demand after opening weekend.`;

  return {
    movieA: first,
    movieB: second,
    summary: cached
  };
}

export function searchMovies(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return movies;
  return movies.filter((movie) => {
    const haystack = `${movie.title} ${movie.originalTitle ?? ""} ${movie.language} ${movie.industry}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
