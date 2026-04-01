# Build Log

## Task 1 - MVP foundation with seeded demo data

- Created the initial Next.js App Router structure with TypeScript and Tailwind CSS.
- Built the core user-facing pages: homepage, movie detail page, and compare page.
- Added seeded demo data for 13 major theatrical releases across Hollywood, Bollywood, Telugu, and Tamil markets.
- Implemented reusable UI components for search, stat cards, movie cards, and daily/cumulative charts.
- Kept routes SEO-friendly and the layout mobile-friendly with a minimal, premium visual direction.
- Intentionally left out auth, reviews, booking flows, CMS, live ingestion, and database wiring from the active app experience.

## Task 2 - UX and UI refinement pass

- Refined the homepage information hierarchy to feel more like a focused product dashboard and less like a content grid.
- Tightened movie detail and compare layouts with calmer stat grouping, clearer chart framing, and improved responsive stacking.
- Added polished empty states for search and chart surfaces.
- Added route loading states with lightweight skeleton placeholders.
- Reduced visual heaviness across cards, spacing, and typography while preserving the seeded MVP scope.

## Task 3 - Environment file setup

- Added a minimal `.env` file with Supabase URL, anon key, and service role key placeholders so credentials can be pasted in directly.

## Task 4 - Schema constraint and trigger refinement

- Added a canonical unique index on `box_office_snapshots` for `(movie_id, date, territory, metric_type)`.
- Added an `updated_at` trigger for `movie_totals` using the shared `set_updated_at()` function.

## Task 5 - Supabase read-path integration

- Added Supabase server/client setup helpers.
- Added a centralized catalog data layer that reads from Supabase and falls back to seeded demo data when env is missing, reads fail, or the database is empty.
- Wired homepage, movie detail, and compare routes to the centralized server-side read layer.
- Updated search, compare picker, and movers components to consume live catalog data instead of importing seed data directly.

## Task 6 - One-time Supabase seed import path

- Added a rerunnable seed import script that upserts the existing demo catalog into Supabase.
- Configured the import to upsert `movies`, `movie_totals`, and `box_office_snapshots` against the current canonical uniqueness model.
- Added README usage notes for running the importer locally.

## Task 7 - Minimal internal manual write path

- Added a minimal internal route for selecting a live movie, updating `movie_totals`, and upserting canonical `box_office_snapshots`.
- Added server-side write actions that use the Supabase service role key only.
- Added README notes for internal route assumptions and setup.

## Task 8 - Minimal internal CSV import flow

- Added internal CSV import actions for bulk upserting `movie_totals` and `box_office_snapshots`.
- Added slug-based movie matching, row validation, partial-success import handling, and concise success/error summaries.
- Added README documentation for the required CSV headers and import rules.

## Task 10 - Cached AI comparison summaries

- Added server-side compare-summary generation using structured stored totals and snapshots only.
- Added cache write/read behavior through `comparisons_cache`, with deterministic fallback if generation is unavailable or fails.
- Kept the compare page UI unchanged while making its summary path meaningfully more intelligent.

## Task 12 - Production deployment readiness

- Hardened Supabase usage so normal server reads use the public anon key and service role remains reserved for writes.
- Added minimal Basic Auth protection for `/internal`.
- Added deployment documentation for Vercel environment variables and custom-domain setup.

## Task 13 - Commit and production safety hardening

- Added a repo-root `.gitignore` for env files, build artifacts, caches, and dependencies.
- Updated `/internal` protection so production fails closed when Basic Auth env vars are missing.
- Updated deployment docs to treat internal Basic Auth env vars as required for production.

## Hotfix - Timestamp-safe date formatting

- Updated shared date formatting to support both plain dates and ISO timestamps from Supabase `updated_at` fields.

## Task 11 - Local OpenAI env file

- Added `.env.local` with placeholders for `OPENAI_API_KEY` and `OPENAI_COMPARE_MODEL`.

## Task 9 - Rehydration handoff file

- Added `rehydration.md` with product context, team roles, communication workflow, current architecture, schema status, and current project state for future Codex chats.
