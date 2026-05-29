-- LifeLens database schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- Profiles: extra user data beyond what Supabase Auth stores
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  work_start   time    default '09:00',
  work_end     time    default '18:00',
  tracking_on  boolean default true,
  created_at   timestamptz default now()
);

-- Automatically create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Events: raw behavioral data from the Chrome extension
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  timestamp     timestamptz not null,
  domain        text not null,
  duration_sec  integer not null default 0,
  activity_type text not null check (activity_type in ('active', 'idle', 'switching')),
  tab_switches  integer not null default 0,
  created_at    timestamptz default now()
);

-- Nudges: AI-generated nudges delivered to the user
create table if not exists public.nudges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  message       text not null,
  category      text not null check (category in ('distraction', 'procrastination', 'overconsumption', 'sleep', 'general')),
  risk_score    float not null default 0,
  triggered_by  text,
  feedback      text check (feedback in ('helpful', 'not_helpful')),
  delivered_at  timestamptz default now(),
  created_at    timestamptz default now()
);

-- Daily insights: one AI summary per user per day
create table if not exists public.daily_insights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  date        date not null,
  summary     text not null,
  top_domains jsonb default '[]',
  risk_level  text not null check (risk_level in ('low', 'medium', 'high')),
  created_at  timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security: each user can only see their own data
alter table public.profiles       enable row level security;
alter table public.events         enable row level security;
alter table public.nudges         enable row level security;
alter table public.daily_insights enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own events"
  on public.events for select using (auth.uid() = user_id);

create policy "Users can insert own events"
  on public.events for insert with check (auth.uid() = user_id);

create policy "Users can view own nudges"
  on public.nudges for select using (auth.uid() = user_id);

create policy "Users can update own nudge feedback"
  on public.nudges for update using (auth.uid() = user_id);

create policy "Users can view own insights"
  on public.daily_insights for select using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists events_user_timestamp    on public.events(user_id, timestamp desc);
create index if not exists nudges_user_delivered    on public.nudges(user_id, delivered_at desc);
create index if not exists insights_user_date       on public.daily_insights(user_id, date desc);
