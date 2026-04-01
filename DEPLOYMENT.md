# BoxOfficeCollect Deployment

## Production env vars

Set these in the Vercel project under Settings -> Environment Variables.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `INTERNAL_BASIC_AUTH_USER`
- `INTERNAL_BASIC_AUTH_PASSWORD`

Recommended:

- `OPENAI_COMPARE_MODEL`
  - suggested value: `gpt-5-mini`

Notes:

- public app reads use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- internal writes and compare-summary cache writes use `SUPABASE_SERVICE_ROLE_KEY`
- compare AI summaries use `OPENAI_API_KEY`
- `/internal` requires `INTERNAL_BASIC_AUTH_USER` and `INTERNAL_BASIC_AUTH_PASSWORD` in production
- if those credentials are missing in production, `/internal` fails closed

## Vercel deployment steps

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and import the repository.
3. Keep the default Next.js framework detection.
4. Add the production environment variables listed above in the project settings.
5. Deploy the project.
6. After deployment, open the production site and verify:
   - homepage loads
   - movie detail routes load
   - compare page loads
   - `/internal` prompts for Basic Auth when internal auth env vars are set
7. If compare AI summaries are enabled, open a compare page for an uncached pair and confirm:
   - a summary renders
   - a row appears in `comparisons_cache`

## Custom domain steps for boxofficecollect.com

1. In the Vercel project, open Settings -> Domains.
2. Add `boxofficecollect.com`.
3. Add `www.boxofficecollect.com` as well.
4. Follow Vercel’s DNS instructions for your registrar.
5. Verify both domains in Vercel.
6. Set your preferred production domain and redirect the alternate host if desired.

## Recommended post-deploy checks

- confirm all required env vars are present in Production
- confirm `/internal` is protected
- confirm Supabase reads are working in production
- confirm internal write flows still work
- confirm compare summary cache generation works server-side

## Current production behavior

- public app is server-rendered dynamically where needed
- seeded fallback remains available if Supabase reads fail or DB is empty
- internal tools are protected with Basic Auth if internal auth env vars are configured
