-- NutriTrack — Supabase Schema
-- Run this in your Supabase SQL Editor

create table if not exists food_log (
  id          bigint primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  date        text not null,
  name        text not null,
  amount      numeric not null,
  unit        text not null default 'g',
  calories    numeric default 0,
  protein     numeric default 0,
  carbs       numeric default 0,
  fat         numeric default 0,
  micros      jsonb default '{}',
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table food_log enable row level security;

-- Policy: users can only see and edit their own rows
create policy "Users own their log"
  on food_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast daily queries
create index if not exists food_log_date_idx on food_log(date, user_id);
