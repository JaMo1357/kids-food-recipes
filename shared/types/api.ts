// Shapes of the Postgres API. See supabase/migrations/*_search.sql.

export type BirthPrecision = 'day' | 'month'

// Filters saved with a child. Open on purpose: search_recipes() ignores keys it
// doesn't know, so these can grow without a schema change.
export interface SavedFilters {
  exclude_allergens?: string[]
  exclude_ingredients?: string[]
}

export interface SearchFilters extends SavedFilters {
  birth_date?: string
  birth_precision?: BirthPrecision
  age_months?: number
  tags?: string[]
  query?: string
  max_minutes?: number
  limit?: number
  offset?: number
}

export interface RecipeCard {
  slug: string
  title: string
  description: string
  min_age_months: number
  max_age_months: number | null
  prep_minutes: number
  illustration: string
  image_path: string | null
  allergens: string[]
  tags: string[]
}

export interface SearchResult {
  age_months: number | null
  total: number
  items: RecipeCard[]
}

export interface RecipeIngredient {
  slug: string
  name: string
  amount: number | null
  unit: string | null
  note: string | null
  is_optional: boolean
}

export interface RecipeDetail extends Omit<RecipeCard, never> {
  id: number
  servings: string
  steps: string[]
  tip: string | null
  source_name: string | null
  source_url: string | null
  ingredients: RecipeIngredient[]
}

export interface FilterOptions {
  allergens: { code: string; name: string; emoji: string }[]
  ingredients: { slug: string; name: string; is_group: boolean }[]
  tags: { slug: string; kind: string; name: string }[]
}

export interface ChildProfile {
  id: string
  name: string | null
  birth_date: string
  birth_precision: BirthPrecision
  filters: SavedFilters
}
