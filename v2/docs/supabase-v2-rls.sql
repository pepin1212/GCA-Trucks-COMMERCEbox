-- COMMERCEbox V2 — schéma cloud (projet Supabase Free SÉPARÉ de V1)
-- Ne crée PAS et ne modifie PAS coffre_snapshots / coffre_parts (réservés à V1).
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- Rejouable (idempotent) : crée les tables si besoin, ajoute les colonnes verrou, (re)pose les policies.

-- 1) Meta snapshot (1 ligne / utilisateur)
create table if not exists public.v2_store (
  user_id uuid primary key references auth.users (id) on delete cascade,
  device text,
  clients integer not null default 0,
  vehicles integer not null default 0,
  parts integer not null default 0,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  migrated_at timestamptz
);

-- 1b) Verrou session appareil (single active device)
-- active_device_id = id stable localStorage de l’appareil qui tient la session
-- heartbeat_at     = dernier ping (~45 s). Une session est « active » si heartbeat < ~3 min.
alter table public.v2_store add column if not exists active_device_id text;
alter table public.v2_store add column if not exists heartbeat_at timestamptz;

-- 2) Morceaux JSON (payload version 9 découpé)
create table if not exists public.v2_parts (
  user_id uuid not null references auth.users (id) on delete cascade,
  idx integer not null check (idx >= 0),
  data text not null,
  primary key (user_id, idx)
);

create index if not exists v2_parts_user_idx on public.v2_parts (user_id, idx);

alter table public.v2_store enable row level security;
alter table public.v2_parts enable row level security;

-- Policies : chaque user ne lit/écrit que sa ligne
drop policy if exists "v2_store_select_own" on public.v2_store;
drop policy if exists "v2_store_insert_own" on public.v2_store;
drop policy if exists "v2_store_update_own" on public.v2_store;
drop policy if exists "v2_store_delete_own" on public.v2_store;

create policy "v2_store_select_own" on public.v2_store
  for select using (auth.uid() = user_id);
create policy "v2_store_insert_own" on public.v2_store
  for insert with check (auth.uid() = user_id);
create policy "v2_store_update_own" on public.v2_store
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "v2_store_delete_own" on public.v2_store
  for delete using (auth.uid() = user_id);

drop policy if exists "v2_parts_select_own" on public.v2_parts;
drop policy if exists "v2_parts_insert_own" on public.v2_parts;
drop policy if exists "v2_parts_update_own" on public.v2_parts;
drop policy if exists "v2_parts_delete_own" on public.v2_parts;

create policy "v2_parts_select_own" on public.v2_parts
  for select using (auth.uid() = user_id);
create policy "v2_parts_insert_own" on public.v2_parts
  for insert with check (auth.uid() = user_id);
create policy "v2_parts_update_own" on public.v2_parts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "v2_parts_delete_own" on public.v2_parts
  for delete using (auth.uid() = user_id);

-- Auth e-mail/mot de passe : dans Authentication → Providers → Email
-- Pour un usage solo rapide : désactiver "Confirm email" si vous préférez.
--
-- Verrou appareil (rappel) :
--   L’app écrit active_device_id + heartbeat_at au login et toutes les ~45 s.
--   Un 2ᵉ appareil avec heartbeat récent (< 3 min) est refusé, avec bouton
--   « Utiliser cet appareil à la place » pour forcer la prise (téléphone perdu).
--   Se déconnecter libère le verrou. Sans ces colonnes, l’app reste utilisable
--   mais le verrou est inactif jusqu’à ce que ce SQL soit rejoué.
