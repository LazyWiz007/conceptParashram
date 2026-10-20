-- Sponsor my trisuit — run once in the Supabase SQL editor.
-- Everything is written through the service-role key from server routes only,
-- so RLS stays on with no public policies.

create table if not exists slot_views (
  slot_id text primary key,
  count   bigint not null default 0
);

create table if not exists visitor_events (
  visitor_hash text primary key,
  country      text not null,
  seen_at      timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists visitor_events_seen_at_idx on visitor_events (seen_at desc);

create table if not exists enquiries (
  id         uuid primary key default gen_random_uuid(),
  slot_id    text not null,
  company    text not null,
  contact    text not null,
  email      text not null,
  phone      text,
  website    text,
  message    text,
  status     text not null default 'new',
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on enquiries (created_at desc);

-- Atomic increment so concurrent viewers cannot clobber each other.
create or replace function increment_slot_view(p_slot_id text)
returns void
language sql
as $$
  insert into slot_views (slot_id, count)
  values (p_slot_id, 1)
  on conflict (slot_id) do update set count = slot_views.count + 1;
$$;

alter table slot_views     enable row level security;
alter table visitor_events enable row level security;
alter table enquiries      enable row level security;
