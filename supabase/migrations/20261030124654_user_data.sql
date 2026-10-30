-- Data owned by registered users. Anonymous visitors keep the same data in
-- their browser only.

create table public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text check (char_length(name) <= 40),
  birth_date date not null,
  -- 'month' means only the year and month are known; the day stored is the 1st.
  birth_precision text not null default 'day' check (birth_precision in ('day', 'month')),
  -- Saved filters, in the same shape as search_recipes() takes them, so a new
  -- kind of filter needs no schema change here.
  filters jsonb not null default '{}' check (jsonb_typeof(filters) = 'object'),
  created_at timestamptz not null default now()
);
create index children_user_id_idx on public.children (user_id);

create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id bigint not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
create index favorites_recipe_id_idx on public.favorites (recipe_id);

-- A photo a parent added to a recipe. Private to them, so no moderation needed.
create table public.user_recipe_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id bigint not null references public.recipes (id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);
create index user_recipe_photos_recipe_id_idx on public.user_recipe_photos (recipe_id);

alter table public.children enable row level security;
alter table public.favorites enable row level security;
alter table public.user_recipe_photos enable row level security;

create policy "Owners read children" on public.children
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners add children" on public.children
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners change children" on public.children
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners remove children" on public.children
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owners read favorites" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners add favorites" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners remove favorites" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owners read photos" on public.user_recipe_photos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners add photos" on public.user_recipe_photos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners change photos" on public.user_recipe_photos
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners remove photos" on public.user_recipe_photos
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.children, public.user_recipe_photos to authenticated;
grant select, insert, delete on public.favorites to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('recipe-images', 'recipe-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('user-photos', 'user-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

-- Objects live under <user id>/. Upsert needs all of select, insert and update.
create policy "Owners read their photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners upload their photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners replace their photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners delete their photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
