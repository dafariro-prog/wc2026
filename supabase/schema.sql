-- ===========================================================================
-- WC 2026! - Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecuta este archivo en: Supabase > SQL Editor > New query > Run
-- ===========================================================================

-- Extensión para UUIDs.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  role        text not null default 'player' check (role in ('admin', 'player')),
  pin_hash    text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- MATCHES
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id                 uuid primary key default gen_random_uuid(),
  match_number       integer not null unique,
  group_name         text not null,
  jornada            integer,
  match_date         date not null,
  match_time         time not null,
  timezone           text not null default 'America/Bogota',
  home_team          text not null,
  away_team          text not null,
  venue              text,
  status             text not null default 'scheduled'
                       check (status in ('scheduled', 'locked', 'finished')),
  home_score         integer check (home_score >= 0),
  away_score         integer check (away_score >= 0),
  points_calculated  boolean not null default false,
  created_at         timestamptz not null default now()
);

-- Marca de tiempo absoluta (UTC) del inicio del partido, derivada de
-- fecha + hora en zona America/Bogota. Se usa para bloquear predicciones.
alter table public.matches
  add column if not exists kickoff_at timestamptz
  generated always as
    ((match_date + match_time) at time zone 'America/Bogota') stored;

create index if not exists matches_kickoff_idx on public.matches (kickoff_at);

-- ---------------------------------------------------------------------------
-- PREDICTIONS  (una por usuario y partido)
-- ---------------------------------------------------------------------------
create table if not exists public.predictions (
  id                    uuid primary key default gen_random_uuid(),
  match_id              uuid not null references public.matches(id) on delete cascade,
  user_id               uuid not null references public.users(id) on delete cascade,
  predicted_home_score  integer not null check (predicted_home_score >= 0),
  predicted_away_score  integer not null check (predicted_away_score >= 0),
  points_awarded        integer not null default 0,
  points_reason         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (match_id, user_id)
);

create index if not exists predictions_user_idx  on public.predictions (user_id);
create index if not exists predictions_match_idx on public.predictions (match_id);

-- ---------------------------------------------------------------------------
-- VISTA DE POSICIONES (standings)
-- Calculada en vivo desde predictions para evitar inconsistencias.
-- Solo cuenta partidos finalizados (points_calculated = true).
-- ---------------------------------------------------------------------------
create or replace view public.standings as
select
  u.id                                                         as user_id,
  u.name                                                       as name,
  coalesce(sum(p.points_awarded), 0)                           as total_points,
  count(p.id) filter (where p.points_reason = 'Marcador exacto')    as exact_count,
  count(p.id) filter (where p.points_reason = 'Resultado acertado') as result_count,
  count(p.id) filter (where p.points_reason = 'Marcador parcial')   as partial_count,
  count(p.id)                                                  as predictions_count
from public.users u
left join public.predictions p
  on p.user_id = u.id
  and p.match_id in (select id from public.matches where points_calculated = true)
where u.role = 'player' or u.role = 'admin'
group by u.id, u.name
order by
  total_points desc,
  exact_count  desc,
  result_count desc,
  predictions_count desc,
  u.name asc;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- La app accede SIEMPRE vía service_role desde el servidor (Server Actions),
-- que ignora RLS. Activamos RLS y NO creamos políticas para anon: así, si la
-- anon key se filtrara, no puede leer ni escribir nada. Defensa en profundidad.
-- ---------------------------------------------------------------------------
alter table public.users       enable row level security;
alter table public.matches     enable row level security;
alter table public.predictions enable row level security;

-- (Sin políticas para anon/authenticated => acceso denegado salvo service_role.)
