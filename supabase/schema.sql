-- =============================================
-- SprintX AI — Supabase Database Schema
-- Run this SQL in: Supabase Dashboard → SQL Editor
-- =============================================

-- Team members (scoped per user via RLS)
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  role text not null,
  permission text default 'DEVELOPER',
  velocity integer default 20,
  custom_fields jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  deadline text,
  created_at timestamptz default now()
);

-- Epics
create table if not exists epics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  created_at timestamptz default now()
);

-- Stories
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  epic_id uuid references epics(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'TODO' check (status in ('TODO', 'IN_PROGRESS', 'IN PROGRESS', 'IN_REVIEW', 'IN REVIEW', 'DONE')),
  required_role text,
  story_points int,
  estimated_hours int,
  assigned_to uuid references team_members(id) on delete set null,
  created_at timestamptz default now()
);

-- Subtasks
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- Performance & Scalability Indexes
-- =============================================
create index if not exists idx_team_members_user_id on team_members(user_id);
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_epics_project_id on epics(project_id);
create index if not exists idx_stories_epic_id on stories(epic_id);
create index if not exists idx_tasks_story_id on tasks(story_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_assigned_to on tasks(assigned_to);
create index if not exists idx_subtasks_task_id on subtasks(task_id);
create index if not exists idx_platform_visits_created_at on platform_visits(created_at desc);
create index if not exists idx_platform_api_keys_is_active on platform_api_keys(is_active);

-- =============================================
-- Enable Row Level Security on ALL tables
-- =============================================
alter table team_members enable row level security;
alter table projects enable row level security;
alter table epics enable row level security;
alter table stories enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;

-- =============================================
-- RLS Policies — Users can only access their own data
-- =============================================

-- Team Members
create policy "Users manage own team" on team_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projects
create policy "Users manage own projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Epics (inherited from projects)
create policy "Users manage own epics" on epics
  for all using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Stories (inherited from epics)
create policy "Users manage own stories" on stories
  for all using (
    epic_id in (
      select id from epics where project_id in (
        select id from projects where user_id = auth.uid()
      )
    )
  );

-- Tasks (inherited from stories)
create policy "Users manage own tasks" on tasks
  for all using (
    story_id in (
      select id from stories where epic_id in (
        select id from epics where project_id in (
          select id from projects where user_id = auth.uid()
        )
      )
    )
  );

-- Subtasks (inherited from tasks)
create policy "Users manage own subtasks" on subtasks
  for all using (
    task_id in (
      select id from tasks where story_id in (
        select id from stories where epic_id in (
          select id from epics where project_id in (
            select id from projects where user_id = auth.uid()
          )
        )
      )
    )
  );

-- =============================================
-- SUPER ADMIN PLATFORM GOVERNANCE & SECURITY
-- =============================================

-- 1. Secure Super Admin Role Verifier
create or replace function is_super_admin()
returns boolean as $$
declare
  v_jwt jsonb;
  v_email text;
  v_role text;
  v_uid uuid;
begin
  v_jwt := auth.jwt();
  if v_jwt is null then
    return false;
  end if;

  v_uid := auth.uid();

  -- Try to get email from JWT first, then fall back to auth.users table
  v_email := lower(coalesce(v_jwt ->> 'email', ''));

  -- If JWT email is missing, query auth.users directly (handles edge cases)
  if v_email = '' and v_uid is not null then
    select lower(email) into v_email from auth.users where id = v_uid;
  end if;

  v_role := coalesce(
    v_jwt -> 'app_metadata' ->> 'role',
    v_jwt -> 'user_metadata' ->> 'role',
    ''
  );

  -- 1. Check metadata role flags
  if v_role = 'SUPER_ADMIN' then
    return true;
  end if;

  -- 2. Check user_metadata is_super_admin flag
  if coalesce((v_jwt -> 'user_metadata' ->> 'is_super_admin')::boolean, false) = true then
    return true;
  end if;

  -- 3. Check hardcoded platform owner email whitelist
  if v_email in ('admin@sprintx.ai', 'yadnesh@sprintx.ai', 'yadnesh.thorat@gmail.com') then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer;

-- 2. Platform Visits & Traffic Logger
create table if not exists platform_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  user_id uuid references auth.users(id) on delete set null,
  path text not null default '/',
  user_agent text,
  ip_address text,
  referrer text,
  created_at timestamptz default now()
);

alter table platform_visits enable row level security;

-- Anonymous and authenticated visitors can only insert visit logs, NEVER read
create policy "Allow anonymous and authenticated visit logging" on platform_visits
  for insert with check (true);

-- Only verified Super Admins can select/read visit traffic
create policy "Super admins only read visits" on platform_visits
  for select using (is_super_admin());

-- 3. Platform Multi-Key AI Vault
create table if not exists platform_api_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'gemini',
  label text not null,
  api_key text not null,
  model text default 'gemini-1.5-pro',
  is_active boolean default true,
  status text default 'ACTIVE',
  latency text,
  last_tested_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table platform_api_keys enable row level security;

-- Strict Super Admin RLS: Unauthorized users get zero rows
create policy "Strict Super Admin access to api keys table" on platform_api_keys
  for all using (is_super_admin()) with check (is_super_admin());

-- =============================================
-- STORED PROCEDURES & SECURE RPC FUNCTIONS
-- =============================================

-- Helper: Mask API secrets on server before sending over wire
create or replace function mask_api_secret(secret text)
returns text as $$
begin
  if length(secret) <= 8 then
    return '••••••••';
  end if;
  return substring(secret from 1 for 7) || '••••••••••••••••' || substring(secret from length(secret) - 3 for 4);
end;
$$ language plpgsql security definer;

-- RPC 1: Log Platform Visit
create or replace function log_platform_visit(
  p_visitor_id text default null,
  p_path text default '/',
  p_user_agent text default null,
  p_referrer text default null
)
returns jsonb as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  insert into platform_visits (visitor_id, user_id, path, user_agent, referrer, created_at)
  values (p_visitor_id, v_user_id, p_path, p_user_agent, p_referrer, now());
  
  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- RPC 2: Masked Platform Key Listing (For AI Key Rotation)
create or replace function get_platform_api_keys()
returns table (
  id uuid,
  provider text,
  label text,
  api_key text,
  model text,
  is_active boolean,
  status text,
  latency text,
  created_at timestamptz
) as $$
begin
  -- Only return active keys with server-masked secrets
  return query
  select 
    k.id,
    k.provider,
    k.label,
    case 
      when is_super_admin() then mask_api_secret(k.api_key)
      else mask_api_secret(k.api_key)
    end as api_key,
    k.model,
    k.is_active,
    k.status,
    k.latency,
    k.created_at
  from platform_api_keys k
  where k.is_active = true or is_super_admin()
  order by k.created_at desc;
end;
$$ language plpgsql security definer;

-- RPC 3: Secure On-Demand Reveal (Super Admin Only)
create or replace function reveal_platform_api_key(p_id uuid)
returns jsonb as $$
declare
  v_raw_key text;
begin
  -- Strict Super Admin Guard
  if not is_super_admin() then
    raise exception 'Unauthorized: Only Super Administrators can reveal platform secrets.';
  end if;

  select api_key into v_raw_key
  from platform_api_keys
  where id = p_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Key not found');
  end if;

  return jsonb_build_object('success', true, 'raw_key', v_raw_key);
end;
$$ language plpgsql security definer;

-- RPC 4: Upsert Platform Key (Super Admin Only)
create or replace function upsert_platform_api_key(
  p_id uuid default null,
  p_label text default '',
  p_provider text default 'gemini',
  p_api_key text default '',
  p_model text default 'gemini-1.5-pro',
  p_is_active boolean default true,
  p_status text default 'ACTIVE',
  p_latency text default null
)
returns jsonb as $$
declare
  v_id uuid;
begin
  -- Strict Super Admin Guard
  if not is_super_admin() then
    raise exception 'Unauthorized: Super Admin access required.';
  end if;

  if p_id is null then
    insert into platform_api_keys (label, provider, api_key, model, is_active, status, latency, last_tested_at)
    values (p_label, p_provider, p_api_key, p_model, p_is_active, p_status, p_latency, now())
    returning id into v_id;
  else
    update platform_api_keys
    set 
      label = coalesce(nullif(p_label, ''), label),
      provider = coalesce(nullif(p_provider, ''), provider),
      api_key = coalesce(nullif(p_api_key, ''), api_key),
      model = coalesce(nullif(p_model, ''), model),
      is_active = coalesce(p_is_active, is_active),
      status = coalesce(nullif(p_status, ''), status),
      latency = coalesce(p_latency, latency),
      last_tested_at = now(),
      updated_at = now()
    where id = p_id
    returning id into v_id;
  end if;

  return jsonb_build_object('success', true, 'id', v_id);
end;
$$ language plpgsql security definer;

-- RPC 5: Delete Platform Key (Super Admin Only)
create or replace function delete_platform_api_key(p_id uuid)
returns jsonb as $$
begin
  -- Strict Super Admin Guard
  if not is_super_admin() then
    raise exception 'Unauthorized: Super Admin access required.';
  end if;

  delete from platform_api_keys where id = p_id;
  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;

-- RPC 6: Aggregated Super Admin Platform Metrics (Super Admin Only)
create or replace function get_superadmin_platform_metrics()
returns jsonb as $$
declare
  v_today_visits int := 0;
  v_weekly_visits int := 0;
  v_total_visits int := 0;
  v_total_users int := 0;
  v_total_projects int := 0;
  v_total_epics int := 0;
  v_total_stories int := 0;
  v_total_tasks int := 0;
  v_total_team_members int := 0;
  v_keys_count int := 0;
  v_workspaces jsonb;
  v_api_keys jsonb;
  v_traffic jsonb;
begin
  -- Strict Super Admin Guard: Reject unauthorized callers
  if not is_super_admin() then
    raise exception 'Unauthorized: Only Super Administrators can view platform-wide analytics.';
  end if;

  -- Visit counts
  select count(*) into v_today_visits from platform_visits where created_at >= date_trunc('day', now());
  select count(*) into v_weekly_visits from platform_visits where created_at >= (now() - interval '7 days');
  select count(*) into v_total_visits from platform_visits;

  -- Platform resource counts
  select count(distinct user_id) into v_total_users from projects;
  select count(*) into v_total_projects from projects;
  select count(*) into v_total_epics from epics;
  select count(*) into v_total_stories from stories;
  select count(*) into v_total_tasks from tasks;
  select count(*) into v_total_team_members from team_members;
  select count(*) into v_keys_count from platform_api_keys where is_active = true;

  -- Workspaces summary: join auth.users to get email & metadata
  select coalesce(jsonb_agg(w), '[]'::jsonb) into v_workspaces from (
    select
      au.id,
      coalesce(au.raw_user_meta_data ->> 'name', au.email) as name,
      coalesce(au.raw_user_meta_data ->> 'organization', 'SprintX Tenant') as organization,
      au.email,
      au.created_at,
      coalesce(
        (au.raw_user_meta_data ->> 'role') = 'SUPER_ADMIN' or
        (au.raw_user_meta_data ->> 'is_super_admin')::boolean = true,
        false
      ) as is_super_admin,
      coalesce((select count(*) from projects p where p.user_id = au.id), 0) as projects_count,
      coalesce((select count(*) from team_members tm where tm.user_id = au.id), 0) as members_count
    from auth.users au
    order by au.created_at desc
    limit 50
  ) w;

  -- Masked API keys
  select coalesce(jsonb_agg(k), '[]'::jsonb) into v_api_keys from (
    select 
      id,
      provider,
      label,
      mask_api_secret(api_key) as api_key,
      model,
      is_active,
      status,
      latency,
      created_at
    from platform_api_keys
    order by created_at desc
  ) k;

  -- Traffic breakdown by route (aliases match frontend: source, visits_count)
  select coalesce(jsonb_agg(t), '[]'::jsonb) into v_traffic from (
    select path as source, count(*) as visits_count
    from platform_visits
    group by path
    order by visits_count desc
    limit 10
  ) t;

  return jsonb_build_object(
    'today_visits', v_today_visits,
    'weekly_visits', v_weekly_visits,
    'total_visits', v_total_visits,
    'total_users', v_total_users,
    'total_projects', v_total_projects,
    'total_epics', v_total_epics,
    'total_stories', v_total_stories,
    'total_tasks', v_total_tasks,
    'total_team_members', v_total_team_members,
    'keys_count', v_keys_count,
    'workspaces', v_workspaces,
    'api_keys', v_api_keys,
    'traffic_breakdown', v_traffic
  );
end;
$$ language plpgsql security definer;

-- RPC 7: Provision Team Member (Scoped to Manager's Workspace)
create or replace function provision_team_member_auth(
  p_manager_id uuid default null,
  p_name text default '',
  p_email text default '',
  p_password text default '',
  p_role text default 'DEVELOPER',
  p_permission text default 'DEVELOPER',
  p_velocity int default 20,
  p_custom_fields jsonb default '{}'::jsonb
)
returns jsonb as $$
declare
  v_user_id uuid;
  v_inserted jsonb;
begin
  v_user_id := coalesce(auth.uid(), p_manager_id);
  if v_user_id is null then
    raise exception 'Unauthorized: Valid authenticated manager required.';
  end if;

  insert into team_members (user_id, name, email, role, permission, velocity, custom_fields)
  values (v_user_id, p_name, p_email, p_role, p_permission, p_velocity, p_custom_fields)
  returning to_jsonb(team_members.*) into v_inserted;

  return v_inserted;
end;
$$ language plpgsql security definer;



