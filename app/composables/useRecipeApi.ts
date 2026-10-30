import type { FilterOptions, RecipeDetail, SearchFilters, SearchResult } from '#shared/types/api'

// The only place that talks to the catalog. It maps 1:1 to Postgres functions,
// which a native client can call the same way.
export function useRecipeApi() {
  const supabase = useSupabaseClient()

  async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const { data, error } = await supabase.rpc(name as never, args as never)
    if (error) throw error
    return data as T
  }

  return {
    search: (filters: SearchFilters) => call<SearchResult>('search_recipes', { p_filters: filters }),
    getRecipe: (slug: string) => call<RecipeDetail | null>('get_recipe', { p_slug: slug }),
    getFilterOptions: () => call<FilterOptions>('get_filter_options'),
  }
}

export function recipeImageUrl(recipe: { illustration: string; image_path: string | null }) {
  if (recipe.image_path) {
    const supabase = useSupabaseClient()
    return supabase.storage.from('recipe-images').getPublicUrl(recipe.image_path).data.publicUrl
  }
  return `/illustrations/${recipe.illustration}.svg`
}
