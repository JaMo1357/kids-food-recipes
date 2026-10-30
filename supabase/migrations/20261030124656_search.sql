-- The API every client (web, future mobile app) uses. Filtering lives here so
-- it can be changed with a migration, without releasing a new app version.

-- Completed months of age. With 'month' precision the child may have been born
-- on any day of that month, so we assume the last one: the youngest possible
-- age, which never shows a recipe too early.
create function public.age_in_months(
  p_birth_date date,
  p_precision text default 'day',
  p_on date default current_date
)
returns integer
language sql
stable
set search_path = ''
as $$
  with birth as (
    select case p_precision
      when 'month' then (date_trunc('month', p_birth_date) + interval '1 month - 1 day')::date
      else p_birth_date
    end as d
  ), span as (
    select age(p_on::timestamp, d::timestamp) as a, d from birth
  )
  select case
    when d > p_on then 0
    else (extract(year from a) * 12 + extract(month from a))::integer
  end
  from span;
$$;

-- p_filters is an open JSON object; unknown keys are ignored, so older app
-- versions keep working when filters are added. Supported keys:
--   age_months           integer, wins over birth_date
--   birth_date           'YYYY-MM-DD'
--   birth_precision      'day' (default) | 'month'
--   exclude_allergens    allergen codes
--   exclude_ingredients  ingredient slugs; a group excludes all its descendants
--   tags                 tag slugs, a recipe needs at least one
--   max_minutes          integer
--   query                free text, accents and case ignored
--   limit, offset        paging, limit is capped at 60
create function public.search_recipes(p_filters jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_age integer := coalesce(
    (p_filters ->> 'age_months')::integer,
    public.age_in_months(
      (p_filters ->> 'birth_date')::date,
      coalesce(p_filters ->> 'birth_precision', 'day')
    )
  );
  v_allergens text[] := array(
    select jsonb_array_elements_text(coalesce(p_filters -> 'exclude_allergens', '[]'))
  );
  v_ingredients text[] := array(
    select jsonb_array_elements_text(coalesce(p_filters -> 'exclude_ingredients', '[]'))
  );
  v_tags text[] := array(
    select jsonb_array_elements_text(coalesce(p_filters -> 'tags', '[]'))
  );
  v_excluded_ids bigint[];
  v_max_minutes integer := (p_filters ->> 'max_minutes')::integer;
  v_query text := lower(extensions.unaccent(nullif(trim(p_filters ->> 'query'), '')));
  v_limit integer := least(coalesce((p_filters ->> 'limit')::integer, 24), 60);
  v_offset integer := greatest(coalesce((p_filters ->> 'offset')::integer, 0), 0);
  v_result jsonb;
begin
  select coalesce(array_agg(t.descendant_id), '{}') into v_excluded_ids
  from public.ingredient_tree t
  join public.ingredients i on i.id = t.ancestor_id
  where i.slug = any (v_ingredients);

  with matched as (
    select f.*
    from public.recipe_facts f
    where (
        v_age is null
        or (f.effective_min_age_months <= v_age
            and (f.max_age_months is null or f.max_age_months >= v_age))
      )
      and not (f.allergen_codes && v_allergens)
      and not (f.ingredient_ids && v_excluded_ids)
      and (cardinality(v_tags) = 0 or f.tag_slugs && v_tags)
      and (v_max_minutes is null or f.prep_minutes <= v_max_minutes)
      and (v_query is null or position(v_query in f.search_text) > 0)
  ), page as (
    select * from matched
    -- With an age set, recipes made for that age come before general ones.
    order by
      case when v_age is null then 0 else effective_min_age_months end desc,
      title collate "cs-CZ-x-icu"
    limit v_limit offset v_offset
  )
  select jsonb_build_object(
    'age_months', v_age,
    'total', (select count(*) from matched),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', p.slug,
        'title', p.title,
        'description', p.description,
        'min_age_months', p.effective_min_age_months,
        'max_age_months', p.max_age_months,
        'prep_minutes', p.prep_minutes,
        'illustration', p.illustration,
        'image_path', p.image_path,
        'allergens', to_jsonb(p.allergen_codes),
        'tags', to_jsonb(p.tag_slugs)
      ))
      from page p
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

create function public.get_recipe(p_slug text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', f.id,
    'slug', f.slug,
    'title', f.title,
    'description', f.description,
    'min_age_months', f.effective_min_age_months,
    'max_age_months', f.max_age_months,
    'prep_minutes', f.prep_minutes,
    'servings', f.servings,
    'steps', to_jsonb(f.steps),
    'tip', f.tip,
    'illustration', f.illustration,
    'image_path', f.image_path,
    'source_name', f.source_name,
    'source_url', f.source_url,
    'allergens', to_jsonb(f.allergen_codes),
    'tags', to_jsonb(f.tag_slugs),
    'ingredients', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'slug', i.slug,
        'name', i.name_cs,
        'amount', ri.amount,
        'unit', ri.unit,
        'note', ri.note,
        'is_optional', ri.is_optional
      ) order by ri.position), '[]'::jsonb)
      from public.recipe_ingredients ri
      join public.ingredients i on i.id = ri.ingredient_id
      where ri.recipe_id = f.id
    )
  )
  from public.recipe_facts f
  where f.slug = p_slug;
$$;

-- Everything the filter screen needs, in one call.
create function public.get_filter_options()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'allergens', (
      select jsonb_agg(jsonb_build_object('code', code, 'name', name_cs, 'emoji', emoji) order by eu_number)
      from public.allergens
    ),
    'ingredients', (
      select jsonb_agg(jsonb_build_object('slug', slug, 'name', name_cs, 'is_group', is_group)
        order by name_cs collate "cs-CZ-x-icu")
      from public.ingredients
    ),
    'tags', (
      select jsonb_agg(jsonb_build_object('slug', slug, 'kind', kind, 'name', name_cs) order by sort_order)
      from public.tags
    )
  );
$$;

-- Lets a user erase their account (GDPR); children, favorites and photo rows
-- cascade. Storage files are removed by the client first, as Postgres can't.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

grant execute on function
  public.age_in_months(date, text, date),
  public.search_recipes(jsonb),
  public.get_recipe(text),
  public.get_filter_options()
to anon, authenticated;
