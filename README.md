# BoxOfficeCollect MVP

Lean Next.js MVP for tracking and comparing box office performance across major theatrical releases.

## Folder structure

```text
app/
  admin/                  Internal manual import and verification UI
  compare/                Movie-vs-movie comparison route
  movies/[slug]/          SEO-friendly movie detail route
  globals.css             Global visual system
  layout.tsx              Root layout and metadata
  page.tsx                Homepage
components/
  ask-ai-card.tsx         AI feature placeholder panel
  box-office-chart.tsx    Single-movie trend chart
  compare-chart.tsx       Two-movie comparison chart
  compare-picker.tsx      Client-side compare selector
  movie-card.tsx          Reusable movie grid card
  movers-list.tsx         Homepage momentum list
  poster-tile.tsx         Stylized poster placeholder card
  search-bar.tsx          Client-side search component
  section-heading.tsx     Section title block
  site-shell.tsx          Shared navigation shell
  stat-card.tsx           Reusable metric card
lib/
  data/movies.ts          Seeded movie catalog, totals, snapshots, and helpers
  types.ts                Shared TypeScript models
  utils.ts                Formatting and class helpers
supabase/
  schema.sql              Initial Postgres schema for MVP
```

## Local run

```bash
npm install
npm run dev
```

## Seed import

Load the current demo catalog into Supabase using the service role key in `.env`:

```bash
npm run import:seed
```

The importer is idempotent for the current schema shape:

- `movies` upserts on `slug`
- `movie_totals` upserts on `movie_id`
- `box_office_snapshots` upserts on `(movie_id, date, territory, metric_type)`

## Internal manual updates

Use the internal maintenance route after the database has movies loaded:

```text
/internal
```

Assumptions:

- `NEXT_PUBLIC_SUPABASE_URL` is set
- `SUPABASE_SERVICE_ROLE_KEY` is set for server-side writes
- the Supabase schema is already applied
- `OPENAI_API_KEY` is optional and enables cached AI comparison summaries on the compare page
- `INTERNAL_BASIC_AUTH_USER` and `INTERNAL_BASIC_AUTH_PASSWORD` should be set in production to protect `/internal`

## Production deployment

Production deployment and custom-domain steps are documented in [DEPLOYMENT.md](/Users/nilabhsinha/Downloads/AI_Products/boxofficecollect.com/DEPLOYMENT.md).

## Internal CSV import format

The internal route also supports CSV uploads for existing movies only. Movie matching uses `slug`.

Movie totals CSV headers:

```text
slug,domestic_gross,overseas_gross,worldwide_gross,india_net,india_gross
```

Snapshot CSV headers:

```text
slug,date,territory,metric_type,amount,currency,source_name,confidence_score,source_url,is_verified
```

Notes:

- `metric_type` must be `daily` or `cumulative`
- `confidence_score` must be between `0` and `1`
- `is_verified` is optional and accepts `true/false`, `yes/no`, or `1/0`
- snapshot imports upsert on `(movie_id, date, territory, metric_type)`
