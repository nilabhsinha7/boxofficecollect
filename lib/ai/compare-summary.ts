import OpenAI from "openai";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { MovieComparison, Snapshot } from "@/lib/types";

type CompareMetrics = {
  openerLeader: string;
  openerGap: number;
  totalLeader: string;
  totalGap: number;
  strongerHold: string;
  holdDelta: number;
  crossoverNote: string | null;
  movieAOpening: number;
  movieBOpening: number;
  movieATotal: number;
  movieBTotal: number;
  movieAHoldRatio: number;
  movieBHoldRatio: number;
};

function getWorldwideSeries(snapshots: Snapshot[], metricType: "daily" | "cumulative") {
  return snapshots
    .filter((entry) => entry.territory === "worldwide" && entry.metricType === metricType)
    .sort((left, right) => left.date.localeCompare(right.date));
}

function ratioOrZero(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function buildComparisonMetrics(comparison: MovieComparison): CompareMetrics {
  const movieADaily = getWorldwideSeries(comparison.movieA.snapshots, "daily");
  const movieBDaily = getWorldwideSeries(comparison.movieB.snapshots, "daily");
  const movieACumulative = getWorldwideSeries(comparison.movieA.snapshots, "cumulative");
  const movieBCumulative = getWorldwideSeries(comparison.movieB.snapshots, "cumulative");

  const movieAOpening = movieADaily[0]?.amount ?? 0;
  const movieBOpening = movieBDaily[0]?.amount ?? 0;
  const movieATotal = comparison.movieA.totals.worldwideGross;
  const movieBTotal = comparison.movieB.totals.worldwideGross;
  const movieALatestDaily = movieADaily.at(-1)?.amount ?? 0;
  const movieBLatestDaily = movieBDaily.at(-1)?.amount ?? 0;
  const movieAHoldRatio = ratioOrZero(movieALatestDaily, movieAOpening);
  const movieBHoldRatio = ratioOrZero(movieBLatestDaily, movieBOpening);

  const openerLeader =
    movieAOpening === movieBOpening
      ? "Neither"
      : movieAOpening > movieBOpening
        ? comparison.movieA.movie.title
        : comparison.movieB.movie.title;

  const totalLeader =
    movieATotal === movieBTotal
      ? "Neither"
      : movieATotal > movieBTotal
        ? comparison.movieA.movie.title
        : comparison.movieB.movie.title;

  const strongerHold =
    movieAHoldRatio === movieBHoldRatio
      ? "Neither"
      : movieAHoldRatio > movieBHoldRatio
        ? comparison.movieA.movie.title
        : comparison.movieB.movie.title;

  const pairedLength = Math.min(movieACumulative.length, movieBCumulative.length);
  let crossoverNote: string | null = null;

  if (pairedLength >= 2) {
    let previousLeader =
      movieACumulative[0].amount === movieBCumulative[0].amount
        ? "tie"
        : movieACumulative[0].amount > movieBCumulative[0].amount
          ? "a"
          : "b";

    for (let index = 1; index < pairedLength; index += 1) {
      const currentLeader =
        movieACumulative[index].amount === movieBCumulative[index].amount
          ? "tie"
          : movieACumulative[index].amount > movieBCumulative[index].amount
            ? "a"
            : "b";

      if (previousLeader !== "tie" && currentLeader !== "tie" && previousLeader !== currentLeader) {
        const winner = currentLeader === "a" ? comparison.movieA.movie.title : comparison.movieB.movie.title;
        crossoverNote = `${winner} overtook the other title on aligned run day ${index + 1}.`;
        break;
      }

      previousLeader = currentLeader;
    }
  }

  return {
    openerLeader,
    openerGap: Math.abs(movieAOpening - movieBOpening),
    totalLeader,
    totalGap: Math.abs(movieATotal - movieBTotal),
    strongerHold,
    holdDelta: Math.abs(movieAHoldRatio - movieBHoldRatio),
    crossoverNote,
    movieAOpening,
    movieBOpening,
    movieATotal,
    movieBTotal,
    movieAHoldRatio,
    movieBHoldRatio
  };
}

function buildDeterministicFallback(comparison: MovieComparison, metrics: CompareMetrics) {
  const openerSentence =
    metrics.openerLeader === "Neither"
      ? `Both films opened at roughly the same worldwide day-one level.`
      : `${metrics.openerLeader} had the bigger opening, ahead by about ${Math.round(metrics.openerGap).toLocaleString()} worldwide on day one.`;

  const holdSentence =
    metrics.strongerHold === "Neither"
      ? `Their current hold pattern is broadly similar relative to opening day.`
      : `${metrics.strongerHold} is showing the stronger current hold, with a better latest-daily-to-opening ratio.`;

  const totalSentence =
    metrics.totalLeader === "Neither"
      ? `Their current worldwide totals are effectively level.`
      : `${metrics.totalLeader} currently leads worldwide by about ${Math.round(metrics.totalGap).toLocaleString()}.`;

  const crossoverSentence = metrics.crossoverNote ? ` ${metrics.crossoverNote}` : "";

  return `${openerSentence} ${holdSentence} ${totalSentence}${crossoverSentence}`.trim();
}

async function generateOpenAiSummary(comparison: MovieComparison, metrics: CompareMetrics) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_COMPARE_MODEL || "gpt-4.1-mini";

  const prompt = {
    movieA: {
      title: comparison.movieA.movie.title,
      industry: comparison.movieA.movie.industry,
      language: comparison.movieA.movie.language,
      openingWorldwide: metrics.movieAOpening,
      currentWorldwideTotal: metrics.movieATotal,
      currentHoldRatio: Number(metrics.movieAHoldRatio.toFixed(3))
    },
    movieB: {
      title: comparison.movieB.movie.title,
      industry: comparison.movieB.movie.industry,
      language: comparison.movieB.movie.language,
      openingWorldwide: metrics.movieBOpening,
      currentWorldwideTotal: metrics.movieBTotal,
      currentHoldRatio: Number(metrics.movieBHoldRatio.toFixed(3))
    },
    comparison: {
      openerLeader: metrics.openerLeader,
      openerGap: Math.round(metrics.openerGap),
      totalLeader: metrics.totalLeader,
      totalGap: Math.round(metrics.totalGap),
      strongerHold: metrics.strongerHold,
      holdDelta: Number(metrics.holdDelta.toFixed(3)),
      crossoverNote: metrics.crossoverNote
    }
  };

  const response = await client.responses.create({
    model,
    temperature: 0.2,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You write concise factual comparison summaries for movie box office runs. Use only the provided structured data. Mention the bigger opener, stronger hold trend, current total leader, and any clear crossover only if supported. Do not invent causes, reviews, audience sentiment, or outside facts. Keep it to 2-3 sentences."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(prompt)
          }
        ]
      }
    ]
  });

  const summary = response.output_text?.trim();
  return summary || null;
}

async function cacheComparisonSummary(movieAId: string, movieBId: string, summary: string) {
  const [firstId, secondId] = movieAId < movieBId ? [movieAId, movieBId] : [movieBId, movieAId];
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("comparisons_cache").upsert(
    {
      movie_a_id: firstId,
      movie_b_id: secondId,
      summary,
      generated_at: new Date().toISOString()
    },
    {
      onConflict: "movie_a_id,movie_b_id"
    }
  );

  if (error) {
    console.error("Could not cache comparison summary.", error);
  }
}

export async function ensureComparisonSummary(comparison: MovieComparison, cachedSummary?: string | null) {
  if (cachedSummary) return cachedSummary;

  const metrics = buildComparisonMetrics(comparison);
  const fallback = buildDeterministicFallback(comparison, metrics);

  try {
    const generated = await generateOpenAiSummary(comparison, metrics);
    if (!generated) return fallback;

    await cacheComparisonSummary(comparison.movieA.movie.id, comparison.movieB.movie.id, generated);
    return generated;
  } catch (error) {
    console.error("Comparison summary generation failed.", error);
    return fallback;
  }
}
