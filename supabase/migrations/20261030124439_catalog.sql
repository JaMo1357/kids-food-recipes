-- Public recipe catalog. Read-only for clients; content is managed through
-- data/ + scripts/build-seed.mjs (see README).

create extension if not exists unaccent with schema extensions;

-- The 14 allergens of EU regulation 1169/2011. `code` is a stable API value.
create table public.allergens (
  code text primary key,
  eu_number smallint not null unique,
  name_cs text not null,
  emoji text not null
);

create table public.ingredients (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_cs text not null,
  -- A tree: excluding "houby" also excludes every kind of mushroom, and a child
  -- inherits the allergens of its ancestors.
  parent_id bigint references public.ingredients (id) on delete restrict,
  -- Group nodes ("ryby") exist for filtering and are never used in a recipe.
  is_group boolean not null default false,
  -- Hard lower age limit. A recipe is never shown to a younger child, whatever
  -- the recipe's own limit says.
  min_age_months smallint not null default 0 check (min_age_months >= 0),
  age_note text,
  created_at timestamptz not null default now()
);
create index ingredients_parent_id_idx on public.ingredients (parent_id);

create table public.ingredient_allergens (
  ingredient_id bigint not null references public.ingredients (id) on delete cascade,
  allergen_code text not null references public.allergens (code) on update cascade,
  primary key (ingredient_id, allergen_code)
);
create index ingredient_allergens_allergen_code_idx on public.ingredient_allergens (allergen_code);

create table public.tags (
  slug text primary key,
  kind text not null check (kind in ('meal', 'diet', 'occasion')),
  name_cs text not null,
  sort_order smallint not null default 0
);

create table public.recipes (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  min_age_months smallint not null check (min_age_months >= 0),
  max_age_months smallint check (max_age_months is null or max_age_months >= min_age_months),
  prep_minutes smallint not null check (prep_minutes > 0),
  servings text not null,
  steps text[] not null check (cardinality(steps) > 0),
  tip text,
  -- Name of a bundled drawing in public/illustrations.
  illustration text not null,
  -- Optional real photo in the public `recipe-images` bucket; overrides the drawing.
  image_path text,
  source_name text,
  source_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  recipe_id bigint not null references public.recipes (id) on delete cascade,
  ingredient_id bigint not null references public.ingredients (id) on delete restrict,
  position smallint not null,
  amount numeric,
  unit text,
  note text,
  is_optional boolean not null default false,
  primary key (recipe_id, ingredient_id)
);
create index recipe_ingredients_ingredient_id_idx on public.recipe_ingredients (ingredient_id);

create table public.recipe_tags (
  recipe_id bigint not null references public.recipes (id) on delete cascade,
  tag_slug text not null references public.tags (slug) on update cascade,
  primary key (recipe_id, tag_slug)
);
create index recipe_tags_tag_slug_idx on public.recipe_tags (tag_slug);

-- Every (ancestor, descendant) pair of the ingredient tree, including self-pairs.
create view public.ingredient_tree with (security_invoker = true) as
with recursive tree as (
  select id as ancestor_id, id as descendant_id from public.ingredients
  union all
  select tree.ancestor_id, child.id
  from tree
  join public.ingredients child on child.parent_id = tree.descendant_id
)
select ancestor_id, descendant_id from tree;

-- One row per recipe with everything the filters need. Optional ingredients
-- count too: a filter must never let an allergen through.
create view public.recipe_facts with (security_invoker = true) as
select
  r.*,
  greatest(r.min_age_months, coalesce(ing.max_ingredient_age, 0))::smallint as effective_min_age_months,
  coalesce(ing.ingredient_ids, '{}') as ingredient_ids,
  coalesce(alg.allergen_codes, '{}') as allergen_codes,
  coalesce(tg.tag_slugs, '{}') as tag_slugs,
  lower(extensions.unaccent(r.title || ' ' || coalesce(ing.ingredient_names, ''))) as search_text
from public.recipes r
left join lateral (
  select
    array_agg(ri.ingredient_id) as ingredient_ids,
    string_agg(i.name_cs, ' ') as ingredient_names,
    max(i.min_age_months) as max_ingredient_age
  from public.recipe_ingredients ri
  join public.ingredients i on i.id = ri.ingredient_id
  where ri.recipe_id = r.id
) ing on true
left join lateral (
  select array_agg(distinct ia.allergen_code order by ia.allergen_code) as allergen_codes
  from public.recipe_ingredients ri
  join public.ingredient_tree t on t.descendant_id = ri.ingredient_id
  join public.ingredient_allergens ia on ia.ingredient_id = t.ancestor_id
  where ri.recipe_id = r.id
) alg on true
left join lateral (
  select array_agg(rt.tag_slug) as tag_slugs
  from public.recipe_tags rt
  where rt.recipe_id = r.id
) tg on true;

alter table public.allergens enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_allergens enable row level security;
alter table public.tags enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_tags enable row level security;

create policy "Allergens are public" on public.allergens
  for select to anon, authenticated using (true);
create policy "Ingredients are public" on public.ingredients
  for select to anon, authenticated using (true);
create policy "Ingredient allergens are public" on public.ingredient_allergens
  for select to anon, authenticated using (true);
create policy "Tags are public" on public.tags
  for select to anon, authenticated using (true);
create policy "Published recipes are public" on public.recipes
  for select to anon, authenticated using (is_published);
create policy "Ingredients of published recipes are public" on public.recipe_ingredients
  for select to anon, authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id));
create policy "Tags of published recipes are public" on public.recipe_tags
  for select to anon, authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id));

grant select on
  public.allergens, public.ingredients, public.ingredient_allergens, public.tags,
  public.recipes, public.recipe_ingredients, public.recipe_tags,
  public.ingredient_tree, public.recipe_facts
to anon, authenticated;
