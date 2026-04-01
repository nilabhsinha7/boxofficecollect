"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function buildRedirectUrl(movieId: string, status: "success" | "error", message: string) {
  const params = new URLSearchParams({
    movieId,
    status,
    message
  });

  return `/internal?${params.toString()}`;
}

function parseNonNegativeNumber(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }
  return parsed;
}

function parseBooleanFlag(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]));
    return {
      rowNumber: index + 2,
      row
    };
  });

  return { headers, rows };
}

function buildImportSummary(kind: string, importedCount: number, errorMessages: string[]) {
  const skippedCount = errorMessages.length;
  const examples = errorMessages.slice(0, 3);
  const base = `${kind} import finished. Imported ${importedCount} row${importedCount === 1 ? "" : "s"}. Skipped ${skippedCount} row${
    skippedCount === 1 ? "" : "s"
  }.`;

  return examples.length > 0 ? `${base} ${examples.join(" ")}` : base;
}

async function getMovieIdBySlugMap() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("movies").select("id, slug");
  if (error) throw error;

  return new Map((data ?? []).map((row) => [String(row.slug), String(row.id)]));
}

function revalidatePublicPaths() {
  revalidatePath("/");
  revalidatePath("/compare");
  revalidatePath("/internal");
  revalidatePath("/movies/[slug]", "page");
}

export async function updateMovieTotalsAction(formData: FormData) {
  const movieId = String(formData.get("movieId") ?? "");
  const movieSlug = String(formData.get("movieSlug") ?? "");

  try {
    if (!movieId || !movieSlug) {
      throw new Error("Missing movie selection.");
    }

    const supabase = getSupabaseAdminClient();

    const payload = {
      movie_id: movieId,
      domestic_gross: parseNonNegativeNumber(formData.get("domesticGross"), "Domestic gross"),
      overseas_gross: parseNonNegativeNumber(formData.get("overseasGross"), "Overseas gross"),
      worldwide_gross: parseNonNegativeNumber(formData.get("worldwideGross"), "Worldwide gross"),
      india_net: parseNonNegativeNumber(formData.get("indiaNet"), "India net"),
      india_gross: parseNonNegativeNumber(formData.get("indiaGross"), "India gross")
    };

    const { error } = await supabase.from("movie_totals").upsert(payload, {
      onConflict: "movie_id"
    });

    if (error) throw error;

    revalidatePublicPaths();
    revalidatePath(`/movies/${movieSlug}`);

    redirect(buildRedirectUrl(movieId, "success", "Movie totals saved."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save movie totals.";
    redirect(buildRedirectUrl(movieId, "error", message));
  }
}

export async function upsertSnapshotAction(formData: FormData) {
  const movieId = String(formData.get("movieId") ?? "");
  const movieSlug = String(formData.get("movieSlug") ?? "");

  try {
    if (!movieId || !movieSlug) {
      throw new Error("Missing movie selection.");
    }

    const date = String(formData.get("date") ?? "").trim();
    const territory = String(formData.get("territory") ?? "").trim().toLowerCase();
    const metricType = String(formData.get("metricType") ?? "").trim().toLowerCase();
    const currency = String(formData.get("currency") ?? "USD").trim().toUpperCase();
    const sourceName = String(formData.get("sourceName") ?? "").trim();
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
    const confidenceScore = Number(formData.get("confidenceScore") ?? "");

    if (!date) throw new Error("Date is required.");
    if (!territory) throw new Error("Territory is required.");
    if (metricType !== "daily" && metricType !== "cumulative") {
      throw new Error("Metric type must be daily or cumulative.");
    }
    if (!sourceName) throw new Error("Source name is required.");
    if (!Number.isFinite(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
      throw new Error("Confidence score must be between 0 and 1.");
    }

    const supabase = getSupabaseAdminClient();

    const payload = {
      movie_id: movieId,
      date,
      territory,
      metric_type: metricType,
      amount: parseNonNegativeNumber(formData.get("amount"), "Amount"),
      currency,
      source_name: sourceName,
      source_url: sourceUrl ? sourceUrl : null,
      confidence_score: confidenceScore,
      is_verified: formData.get("isVerified") === "on"
    };

    const { error } = await supabase.from("box_office_snapshots").upsert(payload, {
      onConflict: "movie_id,date,territory,metric_type"
    });

    if (error) throw error;

    revalidatePublicPaths();
    revalidatePath(`/movies/${movieSlug}`);

    redirect(buildRedirectUrl(movieId, "success", "Snapshot upserted."));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save snapshot.";
    redirect(buildRedirectUrl(movieId, "error", message));
  }
}

export async function importMovieTotalsCsvAction(formData: FormData) {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Please upload a CSV file for movie totals.");
    }

    const csvText = await file.text();
    const { rows } = parseCsv(csvText);
    const movieIdBySlug = await getMovieIdBySlugMap();
    const validRows: Array<{
      movie_id: string;
      domestic_gross: number;
      overseas_gross: number;
      worldwide_gross: number;
      india_net: number;
      india_gross: number;
    }> = [];
    const errors: string[] = [];

    for (const entry of rows) {
      const slug = String(entry.row.slug ?? "").trim();
      const movieId = movieIdBySlug.get(slug);

      if (!slug) {
        errors.push(`Row ${entry.rowNumber}: missing slug.`);
        continue;
      }

      if (!movieId) {
        errors.push(`Row ${entry.rowNumber}: unknown movie slug "${slug}".`);
        continue;
      }

      const domesticGross = Number(entry.row.domestic_gross);
      const overseasGross = Number(entry.row.overseas_gross);
      const worldwideGross = Number(entry.row.worldwide_gross);
      const indiaNet = Number(entry.row.india_net);
      const indiaGross = Number(entry.row.india_gross);

      if ([domesticGross, overseasGross, worldwideGross, indiaNet, indiaGross].some((value) => !Number.isFinite(value) || value < 0)) {
        errors.push(`Row ${entry.rowNumber}: totals values must all be valid non-negative numbers.`);
        continue;
      }

      validRows.push({
        movie_id: movieId,
        domestic_gross: domesticGross,
        overseas_gross: overseasGross,
        worldwide_gross: worldwideGross,
        india_net: indiaNet,
        india_gross: indiaGross
      });
    }

    if (validRows.length > 0) {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from("movie_totals").upsert(validRows, {
        onConflict: "movie_id"
      });

      if (error) throw error;
      revalidatePublicPaths();
    }

    redirect(
      buildRedirectUrl(
        "",
        errors.length === 0 ? "success" : "error",
        buildImportSummary("Totals CSV", validRows.length, errors)
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import movie totals CSV.";
    redirect(buildRedirectUrl("", "error", message));
  }
}

export async function importSnapshotsCsvAction(formData: FormData) {
  try {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Please upload a CSV file for snapshots.");
    }

    const csvText = await file.text();
    const { rows } = parseCsv(csvText);
    const movieIdBySlug = await getMovieIdBySlugMap();
    const validRows: Array<{
      movie_id: string;
      date: string;
      territory: string;
      metric_type: "daily" | "cumulative";
      amount: number;
      currency: string;
      source_name: string;
      source_url: string | null;
      confidence_score: number;
      is_verified: boolean;
    }> = [];
    const errors: string[] = [];

    for (const entry of rows) {
      const slug = String(entry.row.slug ?? "").trim();
      const movieId = movieIdBySlug.get(slug);
      const date = String(entry.row.date ?? "").trim();
      const territory = String(entry.row.territory ?? "").trim().toLowerCase();
      const metricType = String(entry.row.metric_type ?? "").trim().toLowerCase();
      const amount = Number(entry.row.amount);
      const currency = String(entry.row.currency ?? "USD").trim().toUpperCase();
      const sourceName = String(entry.row.source_name ?? "").trim();
      const sourceUrl = String(entry.row.source_url ?? "").trim();
      const confidenceScore = Number(entry.row.confidence_score);
      const isVerified = parseBooleanFlag(entry.row.is_verified);

      if (!slug) {
        errors.push(`Row ${entry.rowNumber}: missing slug.`);
        continue;
      }

      if (!movieId) {
        errors.push(`Row ${entry.rowNumber}: unknown movie slug "${slug}".`);
        continue;
      }

      if (!date) {
        errors.push(`Row ${entry.rowNumber}: missing date.`);
        continue;
      }

      if (!territory) {
        errors.push(`Row ${entry.rowNumber}: missing territory.`);
        continue;
      }

      if (metricType !== "daily" && metricType !== "cumulative") {
        errors.push(`Row ${entry.rowNumber}: metric_type must be daily or cumulative.`);
        continue;
      }

      if (!Number.isFinite(amount) || amount < 0) {
        errors.push(`Row ${entry.rowNumber}: amount must be a valid non-negative number.`);
        continue;
      }

      if (!sourceName) {
        errors.push(`Row ${entry.rowNumber}: source_name is required.`);
        continue;
      }

      if (!Number.isFinite(confidenceScore) || confidenceScore < 0 || confidenceScore > 1) {
        errors.push(`Row ${entry.rowNumber}: confidence_score must be between 0 and 1.`);
        continue;
      }

      validRows.push({
        movie_id: movieId,
        date,
        territory,
        metric_type: metricType,
        amount,
        currency,
        source_name: sourceName,
        source_url: sourceUrl || null,
        confidence_score: confidenceScore,
        is_verified: isVerified
      });
    }

    if (validRows.length > 0) {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from("box_office_snapshots").upsert(validRows, {
        onConflict: "movie_id,date,territory,metric_type"
      });

      if (error) throw error;
      revalidatePublicPaths();
    }

    redirect(
      buildRedirectUrl(
        "",
        errors.length === 0 ? "success" : "error",
        buildImportSummary("Snapshots CSV", validRows.length, errors)
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import snapshots CSV.";
    redirect(buildRedirectUrl("", "error", message));
  }
}
