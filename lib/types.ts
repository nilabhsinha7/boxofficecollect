export type Industry = "Hollywood" | "Bollywood" | "Telugu" | "Tamil";

export type Movie = {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  releaseDate: string;
  language: string;
  industry: Industry;
  posterUrl?: string;
  synopsis: string;
  status: "active" | "cooling" | "upcoming";
};

export type MovieTotals = {
  movieId: string;
  domesticGross: number;
  overseasGross: number;
  worldwideGross: number;
  indiaNet: number;
  indiaGross: number;
  updatedAt: string;
};

export type Snapshot = {
  id: string;
  movieId: string;
  date: string;
  territory: string;
  metricType: "daily" | "cumulative";
  amount: number;
  currency: string;
  sourceName: string;
  sourceUrl?: string;
  confidenceScore: number;
  isVerified: boolean;
};

export type ComparisonCache = {
  movieAId: string;
  movieBId: string;
  summary: string;
  generatedAt: string;
};

export type MovieWithTotals = {
  movie: Movie;
  totals: MovieTotals;
  snapshots: Snapshot[];
  aiSummary: string;
};

export type FeaturedMovie = {
  movie: Movie;
  totals: MovieTotals;
};

export type MovieMover = {
  movie: Movie;
  latest: number;
  delta: number;
};

export type MovieComparison = {
  movieA: MovieWithTotals;
  movieB: MovieWithTotals;
  summary: string;
};
