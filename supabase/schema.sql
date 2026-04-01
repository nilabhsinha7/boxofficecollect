create extension if not exists "pgcrypto";

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  original_title text,
  release_date date not null,
  language text not null,
  industry text not null,
  poster_url text,
  synopsis text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.movie_totals (
  movie_id uuid primary key references public.movies(id) on delete cascade,
  domestic_gross numeric(14, 2) not null default 0,
  overseas_gross numeric(14, 2) not null default 0,
  worldwide_gross numeric(14, 2) not null default 0,
  india_net numeric(14, 2) not null default 0,
  india_gross numeric(14, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.box_office_snapshots (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  date date not null,
  territory text not null,
  metric_type text not null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  source_name text not null,
  source_url text,
  confidence_score numeric(4, 3) not null default 0.800,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comparisons_cache (
  movie_a_id uuid not null references public.movies(id) on delete cascade,
  movie_b_id uuid not null references public.movies(id) on delete cascade,
  summary text not null,
  generated_at timestamptz not null default now(),
  primary key (movie_a_id, movie_b_id)
);

create table if not exists public.source_ingestion_logs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  fetch_time timestamptz not null default now(),
  status text not null,
  notes text,
  raw_payload jsonb
);

create index if not exists idx_movies_release_date on public.movies (release_date desc);
create index if not exists idx_movies_industry on public.movies (industry);
create index if not exists idx_box_office_snapshots_movie_date on public.box_office_snapshots (movie_id, date desc);
create index if not exists idx_box_office_snapshots_verified on public.box_office_snapshots (is_verified, date desc);
create unique index if not exists uq_box_office_snapshots_movie_date_territory_metric
on public.box_office_snapshots (movie_id, date, territory, metric_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_movies_updated_at on public.movies;
create trigger trg_movies_updated_at
before update on public.movies
for each row
execute function public.set_updated_at();

drop trigger if exists trg_movie_totals_updated_at on public.movie_totals;
create trigger trg_movie_totals_updated_at
before update on public.movie_totals
for each row
execute function public.set_updated_at();
