-- =============================================
-- SlamBeauty Initial Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. profiles (linked to Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('brand', 'influencer')),
  created_at timestamptz default now()
);

-- 2. brand_profiles
create table public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  logo_url text,
  website text,
  description text,
  created_at timestamptz default now()
);

-- 3. influencer_profiles
create table public.influencer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  avatar_url text,
  bio text,
  instagram_handle text,
  tiktok_handle text,
  twitter_handle text,
  instagram_followers int default 0,
  tiktok_followers int default 0,
  twitter_followers int default 0,
  primary_platform text check (primary_platform in ('Instagram', 'TikTok', 'Twitter')),
  categories text[] default '{}',
  created_at timestamptz default now()
);

-- 4. campaigns
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  product_name text not null,
  product_image_url text,
  category text not null default '메이크업',
  description text not null default '',
  guidelines text[] not null default '{}',
  platforms text[] not null default '{}',
  target_countries text[] not null default '{}',
  target_gender text not null default '무관' check (target_gender in ('여성', '남성', '무관')),
  target_age_min int not null default 18,
  target_age_max int not null default 40,
  recruit_count int not null default 10,
  budget_per_influencer int not null,
  recruit_start_date date not null,
  recruit_deadline date not null,
  selection_deadline date not null,
  shipping_date date not null,
  content_deadline date not null,
  status text not null default 'recruiting' check (status in ('recruiting', 'in_progress', 'review', 'completed')),
  created_at timestamptz default now()
);

-- 5. campaign_applications (인플루언서 지원)
create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  influencer_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  applied_at timestamptz default now(),
  reviewed_at timestamptz,
  unique(campaign_id, influencer_id)
);

-- 6. campaign_influencers (선정된 인플루언서 진행 상태)
create table public.campaign_influencers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  influencer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'selected' check (
    status in ('selected', 'shipped', 'received', 'submitted', 'revision', 'final_ok', 'settled')
  ),
  tracking_number text,
  content_url text,
  revision_note text,
  joined_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(campaign_id, influencer_id)
);

-- 7. notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.profiles enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.influencer_profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.campaign_influencers enable row level security;
alter table public.notifications enable row level security;

-- profiles: 본인만 읽기/수정
create policy "profiles: own read" on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);
create policy "profiles: insert on signup" on public.profiles for insert with check (auth.uid() = id);

-- brand_profiles: 본인 CRUD, 모두 읽기
create policy "brand_profiles: all read" on public.brand_profiles for select using (true);
create policy "brand_profiles: own write" on public.brand_profiles for all using (auth.uid() = user_id);

-- influencer_profiles: 본인 CRUD, 모두 읽기
create policy "influencer_profiles: all read" on public.influencer_profiles for select using (true);
create policy "influencer_profiles: own write" on public.influencer_profiles for all using (auth.uid() = user_id);

-- campaigns: 모두 읽기, 브랜드 본인만 쓰기
create policy "campaigns: all read" on public.campaigns for select using (true);
create policy "campaigns: brand write" on public.campaigns for insert with check (auth.uid() = brand_id);
create policy "campaigns: brand update" on public.campaigns for update using (auth.uid() = brand_id);
create policy "campaigns: brand delete" on public.campaigns for delete using (auth.uid() = brand_id);

-- campaign_applications: 인플루언서 본인 + 해당 캠페인 브랜드
create policy "applications: influencer own" on public.campaign_applications
  for all using (auth.uid() = influencer_id);
create policy "applications: brand read" on public.campaign_applications
  for select using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
  );
create policy "applications: brand update" on public.campaign_applications
  for update using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
  );

-- campaign_influencers: 인플루언서 본인 + 해당 캠페인 브랜드
create policy "ci: influencer own" on public.campaign_influencers
  for all using (auth.uid() = influencer_id);
create policy "ci: brand all" on public.campaign_influencers
  for all using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.brand_id = auth.uid())
  );

-- notifications: 본인만
create policy "notifications: own" on public.notifications for all using (auth.uid() = user_id);

-- =============================================
-- Auto-create profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'influencer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at auto-update for campaign_influencers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger campaign_influencers_updated_at
  before update on public.campaign_influencers
  for each row execute procedure public.set_updated_at();
