-- MG Kutz — Supabase Schema
-- Run this in your Supabase project's SQL Editor (https://supabase.com → your project → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Barbers table
create table if not exists barbers (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid references auth.users(id) on delete cascade,
  name text not null,
  bio text default '',
  specialties text[] default '{}',
  years_exp int default 0,
  profile_photo text default '',
  gcal_token jsonb default null,
  gcal_calendar_id text default '',
  created_at timestamptz default now()
);

-- Portfolio photos table
create table if not exists portfolio_photos (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid references barbers(id) on delete cascade not null,
  storage_path text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid references barbers(id) on delete cascade not null,
  service text not null,
  client_name text not null,
  client_phone text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  gcal_event_id text default '',
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table barbers enable row level security;
alter table portfolio_photos enable row level security;
alter table bookings enable row level security;

-- RLS Policies: barbers table
-- Anyone can read barbers (public profiles)
create policy "Public barbers read" on barbers for select using (true);
-- Only the barber themselves can update their row
create policy "Barbers update own row" on barbers for update using (auth.uid() = auth_id);
-- Barbers can insert their own row
create policy "Barbers insert own row" on barbers for insert with check (auth.uid() = auth_id);

-- RLS Policies: portfolio_photos
-- Anyone can read portfolio photos
create policy "Public portfolio read" on portfolio_photos for select using (true);
-- Barbers can insert their own photos
create policy "Barbers insert own photos" on portfolio_photos for insert
  with check (barber_id in (select id from barbers where auth_id = auth.uid()));
-- Barbers can delete their own photos
create policy "Barbers delete own photos" on portfolio_photos for delete
  using (barber_id in (select id from barbers where auth_id = auth.uid()));
-- Barbers can update order of their own photos
create policy "Barbers update own photos" on portfolio_photos for update
  using (barber_id in (select id from barbers where auth_id = auth.uid()));

-- RLS Policies: bookings
-- Anyone can insert bookings (clients booking appointments)
create policy "Public booking insert" on bookings for insert with check (true);
-- Barbers can read their own bookings
create policy "Barbers read own bookings" on bookings for select
  using (barber_id in (select id from barbers where auth_id = auth.uid()));

-- Storage bucket (run in Storage settings or via this SQL)
-- NOTE: Create a bucket named "portfolio-photos" in Supabase Storage dashboard
-- Set it to Public so profile images load without auth
