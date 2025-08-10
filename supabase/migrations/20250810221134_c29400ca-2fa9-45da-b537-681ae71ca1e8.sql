create or replace function public.insert_knowledge_entry(
  p_company_id uuid,
  p_namespace text,
  p_content text,
  p_metadata jsonb,
  p_embedding double precision[]
) returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
begin
  -- Basic validation
  if p_company_id is null then
    raise exception 'company_id is required';
  end if;

  insert into public.knowledge_entries (
    company_id, namespace, content, metadata, embedding
  ) values (
    p_company_id,
    coalesce(p_namespace, 'default'),
    p_content,
    coalesce(p_metadata, '{}'::jsonb),
    p_embedding::vector
  ) returning id into v_id;

  return v_id;
end;
$$;