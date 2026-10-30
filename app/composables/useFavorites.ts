import type { RecipeDetail } from '#shared/types/api'

export function useFavorites() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function isFavorite(recipeId: number) {
    if (!user.value) return false
    const { count } = await supabase
      .from('favorites' as never)
      .select('recipe_id', { count: 'exact', head: true })
      .eq('recipe_id', recipeId)
    return (count ?? 0) > 0
  }

  async function setFavorite(recipeId: number, favorite: boolean) {
    const query = favorite
      ? supabase.from('favorites' as never).insert({ recipe_id: recipeId } as never)
      : supabase.from('favorites' as never).delete().eq('recipe_id', recipeId)
    const { error } = await query
    if (error) throw error
  }

  async function list() {
    const { data, error } = await supabase
      .from('favorites' as never)
      .select('recipes(slug, title, description, min_age_months, max_age_months, prep_minutes, illustration, image_path)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as unknown as { recipes: Omit<RecipeDetail, 'allergens' | 'tags'> }[]).map((row) => row.recipes)
  }

  return { isFavorite, setFavorite, list }
}
