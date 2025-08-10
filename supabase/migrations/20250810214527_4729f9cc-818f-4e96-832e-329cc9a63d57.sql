-- Enable pgvector for embeddings
create extension if not exists vector;

-- Knowledge base table for long-term memory
create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  namespace text not null default 'default',
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast similarity search
create index if not exists idx_knowledge_entries_company_namespace
  on public.knowledge_entries (company_id, namespace);

create index if not exists idx_knowledge_entries_embedding
  on public.knowledge_entries using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RLS policies
alter table public.knowledge_entries enable row level security;

create policy "Knowledge: select by company"
  on public.knowledge_entries for select
  using (can_access_company_data(company_id));

create policy "Knowledge: insert by managers"
  on public.knowledge_entries for insert
  with check (can_manage_company_data(company_id));

create policy "Knowledge: update by managers"
  on public.knowledge_entries for update
  using (can_manage_company_data(company_id));

create policy "Knowledge: delete by managers"
  on public.knowledge_entries for delete
  using (can_manage_company_data(company_id));

-- Updated-at trigger
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_knowledge_entries_updated_at
  before update on public.knowledge_entries
  for each row execute function public.touch_updated_at();

-- Semantic search RPC using pgvector (cosine similarity)
create or replace function public.search_knowledge(
  company_uuid uuid,
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 8,
  namespace_filter text default 'default'
) returns table(
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  return query
  select
    ke.id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from public.knowledge_entries ke
  where ke.company_id = company_uuid
    and (namespace_filter is null or ke.namespace = namespace_filter)
    and (1 - (ke.embedding <=> query_embedding)) >= match_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
end;
$$;