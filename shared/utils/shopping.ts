import type { RecipeIngredient } from '../types/api'

export const groceryStores = [
  { id: 'kosik', name: 'Košík.cz', url: 'https://www.kosik.cz/' },
  { id: 'rohlik', name: 'Rohlík.cz', url: 'https://www.rohlik.cz/' },
  { id: 'foodora', name: 'foodora', url: 'https://www.foodora.cz/' },
  { id: 'tesco', name: 'Tesco Online', url: 'https://nakup.itesco.cz/' },
] as const

export function formatIngredientAmount(ingredient: RecipeIngredient) {
  if (ingredient.amount === null) return ''
  const amount = String(ingredient.amount).replace('.', ',').replace(/^0,5$/, '½').replace(/^0,25$/, '¼')
  return [amount, ingredient.unit].filter(Boolean).join(' ')
}

export function shoppingListText(title: string, servings: string, ingredients: RecipeIngredient[]) {
  if (!ingredients.length) return ''
  return [title, servings, '', ...ingredients.map((ingredient) => {
    const notes = [ingredient.is_optional ? 'nepovinné' : '', ingredient.note].filter(Boolean)
    return `• ${[formatIngredientAmount(ingredient), ingredient.name].filter(Boolean).join(' ')}${notes.length ? ` (${notes.join(', ')})` : ''}`
  })].join('\n')
}
