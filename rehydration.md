# BoxOfficeCollect Rehydration

## Product description

BoxOfficeCollect is a focused box office tracker for major theatrical releases.

Core product value:

- search major movies quickly
- view daily and cumulative box office performance
- compare two movies side by side
- support structured AI analysis later using database-backed box office data

Product positioning:

- simple
- premium-feeling
- fast
- focused on box office tracking and comparison
- not an IMDb clone, review site, ticketing product, or entertainment news portal

Current scope emphasis:

- Hollywood wide releases
- major Bollywood releases
- major Telugu releases
- major Tamil releases
- current major theatrical titles first

## Roles

- CEO: final decision maker
- PM Strategist / ChatGPT: product strategist, PM, business and UX lead
- Codex: technical developer and technical advisor, responsible for implementation details and code changes

## Communication workflow

1. ChatGPT provides exactly one numbered task at a time.
2. CEO either asks questions or approves the task and sends it to Codex.
3. Codex implements only that approved task unless explicitly told otherwise.
4. After implementation, Codex returns a structured status report.
5. CEO pastes that status report back into ChatGPT.
6. ChatGPT reviews the result and provides the next numbered task.

## Important rules

- Do not overbuild.
- Do not add extra features outside the approved task.
- Prefer the simplest production-lean implementation.
- If something is unclear, make the smallest reasonable assumption and state it in the status report.
- If there is a better technical option, mention it in recommendations, but do not change product scope without approval.
- Maintain `Build_log.md` and update it after every completed task.
- Do not do two major tasks in one turn unless explicitly asked.

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Supabase Postgres
- Supabase service role key for internal writes/imports
- Seeded fallback dataset still present in code

## Environment assumptions

Expected env vars in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Current architecture

### Public app

- homepage: `/`
- movie detail: `/movies/[slug]`
- compare page: `/compare`

These routes read from a centralized catalog data layer that:

- uses Supabase reads when configured and available
- falls back to the seeded demo dataset if env is missing, reads fail, or DB is empty

Main data access files:

- `lib/data/catalog.ts`
- `lib/data/movies.ts`
- `lib/supabase/server.ts`
- `lib/supabase/config.ts`

### Internal operations

- internal manual maintenance route: `/internal`

Current internal capabilities:

- select an existing movie from Supabase
- update `movie_totals`
- upsert one `box_office_snapshots` row manually
- bulk import `movie_totals` CSV
- bulk import `box_office_snapshots` CSV
- compare summary cache writes server-side

Server-side write files:

- `lib/supabase/admin.ts`
- `app/internal/actions.ts`
- `middleware.ts` protects `/internal`

## Database schema status

Current schema includes:

- `movies`
- `movie_totals`
- `box_office_snapshots`
- `comparisons_cache`
- `source_ingestion_logs`

Important constraints/triggers:

- unique snapshot index on `(movie_id, date, territory, metric_type)`
- `movies.updated_at` trigger
- `movie_totals.updated_at` trigger

Schema file:

- `supabase/schema.sql`

## Seed/import status

One-time importer exists and has already been run successfully.

Importer command:

```bash
npm run import:seed
```

Importer behavior:

- upserts `movies` on `slug`
- upserts `movie_totals` on `movie_id`
- upserts `box_office_snapshots` on `(movie_id, date, territory, metric_type)`

Last known successful import result:

- Movies upserted: 13
- Movie totals upserted: 13
- Snapshots upserted: 472

Importer file:

- `scripts/import-seed.ts`

## CSV import format

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
- `is_verified` accepts `true/false`, `yes/no`, or `1/0`
- imports require existing movies and do not create new ones

## UX/design direction

- minimal
- premium
- neutral dark-light feel
- lots of breathing room
- finance/product dashboard sensibility
- avoid entertainment-site chaos
- prioritize search, charts, comparisons, and core stats

## Completed work summary

1. MVP foundation built with homepage, movie detail, compare page, seeded data, and reusable components.
2. UX/UI refinement pass completed for hierarchy, spacing, charts, loading states, empty states, and mobile responsiveness.
3. `.env` created for Supabase credentials.
4. Schema refined with canonical snapshot uniqueness and `movie_totals` update trigger.
5. Supabase live read path implemented with seeded fallback.
6. One-time Supabase seed importer implemented and executed successfully.
7. Minimal internal manual update route implemented.
8. Minimal internal CSV bulk import flow implemented.
9. Compare-page AI summary generation and caching implemented.
10. Deployment hardening added for `/internal` and Vercel production readiness.

## Known limitations

- no full auth system yet
- no movie creation flow yet
- no CSV upload history/log UI yet
- no automated ingestion yet
- no scraping yet
- no movie-level AI summary generation yet
- no public admin system
- `/internal` uses Basic Auth middleware rather than a full auth layer

## Good next-task candidates

- add minimal movie creation flow for internal use
- add internal import logging into `source_ingestion_logs`
- harden deploy/ops monitoring after first production launch

## Files worth reading first in a new chat

- `Build_log.md`
- `README.md`
- `supabase/schema.sql`
- `lib/data/catalog.ts`
- `app/internal/actions.ts`
- `app/internal/page.tsx`
- `scripts/import-seed.ts`
