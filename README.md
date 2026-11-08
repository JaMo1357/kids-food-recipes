# Lžička

Recepty pro děti podle věku. Nuxt 4 + Supabase, mobile-first, česky.

## Lokální vývoj

Potřebuje Docker.

```bash
pnpm install
pnpm db:start        # spustí lokální Supabase
pnpm db:reset        # migrace + recepty
cp .env.example .env # doplňte URL a klíč z `pnpm exec supabase status`
pnpm dev
```

Lokálně použijte testovací klíč Turnstile `1x00000000000000000000AA`. Potvrzovací e-maily najdete v Mailpitu na <http://127.0.0.1:54324>.

## Nasazení do vlastního Supabase projektu

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <ref>
pnpm exec supabase db push --include-seed
```

Pak v dashboardu Supabase:

1. **Authentication → Attack Protection**: zapněte CAPTCHA, provider Turnstile, a vložte secret z Cloudflare.
2. **Authentication → URL Configuration**: nastavte Site URL a povolené redirecty (`https://<domena>/**`).
3. Ve hostingu nastavte `SUPABASE_URL`, `SUPABASE_KEY` (publishable) a `NUXT_PUBLIC_TURNSTILE_SITE_KEY`.

Bez zapnuté CAPTCHA v Supabase kontroluje widget jen prohlížeč, ne server.

## Jak se mění filtrování

Veškerá logika je v Postgres funkci `search_recipes(p_filters jsonb)` a aplikace jen posílá JSON.

| Změna | Kde | Vydání aplikace? |
| --- | --- | --- |
| Nové pravidlo, oprava logiky | nová migrace, `create or replace function` | ne |
| Nový klíč filtru | funkce + UI, které ho posílá | jen UI |
| Nová surovina, alergen, věková hranice | `data/ingredients.mjs` | ne |
| Nový recept | `data/recipes.mjs` | ne |

Neznámé klíče funkce ignoruje a dětem se ukládají do `children.filters` (jsonb), takže starší verze aplikace dál fungují. Migrace jen přidávejte, nikdy needitujte ty už nasazené.

## Obsah

`data/` je zdroj pravdy. Po úpravě spusťte:

```bash
pnpm seed:build
pnpm exec supabase db push --include-seed
```

`seed:build` odmítne surovinu bez uvedených alergenů nebo neznámou surovinu v receptu. Seed je opakovatelný a uživatelská data nemění; recept odebraný z `data/` se jen skryje. Vlastní fotky receptů nahrajte do bucketu `recipe-images` a cestu uložte do `recipes.image_path`. Jinak se použije ilustrační fotka z `public/photos` a nakonec kresba z `public/illustrations` (viz [docs/content-sources.md](docs/content-sources.md)).

Zdroje a věková pravidla: [docs/content-sources.md](docs/content-sources.md).

## Mobilní aplikace

Příprava je hotová, není potřeba nic přepisovat:

- Filtrování, věk i recepty běží v Postgresu, klient je volá přes `supabase.rpc` ([useRecipeApi.ts](app/composables/useRecipeApi.ts)). Aplikace nemá vlastní serverové API, na kterém by závisela.
- `pnpm generate:mobile` vytvoří statickou SPA v `.output/public`.

Nejrychlejší cesta je [Capacitor](https://capacitorjs.com), který tuto SPA zabalí pro iOS a Android:

```bash
pnpm add @capacitor/core @capacitor/ios @capacitor/android
pnpm add -D @capacitor/cli
pnpm exec cap init Lzicka cz.lzicka.app --web-dir .output/public
pnpm exec cap add ios
pnpm exec cap add android
```

Co bude potřeba dodělat v aplikaci: deep link `cz.lzicka.app://auth/callback` pro potvrzovací e-maily (redirect je v `supabase/config.toml` připravený) a vyřešení CAPTCHA, protože Turnstile vyžaduje povolenou doménu a v nativním WebView nefunguje bez úprav. Nativní klient (React Native, Flutter) by volal tytéž funkce.
