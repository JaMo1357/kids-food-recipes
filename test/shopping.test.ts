import { describe, expect, it } from 'vitest'
import type { RecipeIngredient } from '../shared/types/api'
import { formatIngredientAmount, shoppingListText } from '../shared/utils/shopping'

const carrot: RecipeIngredient = { slug: 'mrkev', name: 'Mrkev', amount: 0.5, unit: 'ks', note: 'oloupaná', is_optional: false }

describe('shopping list export', () => {
  it('preserves amounts, notes and optional ingredients in Czech', () => {
    expect(shoppingListText('Polévka', '2 porce', [carrot, { ...carrot, slug: 'olej', name: 'Olej', amount: null, unit: null, note: null, is_optional: true }]))
      .toBe('Polévka\n2 porce\n\n• ½ ks Mrkev (oloupaná)\n• Olej (nepovinné)')
  })
  it('exports only supplied selections and no content for an empty selection', () => {
    expect(shoppingListText('Polévka', '2 porce', [])).toBe('')
    expect(shoppingListText('Polévka', '2 porce', [carrot])).not.toContain('Olej')
  })
  it('handles fractional amounts and missing units', () => {
    expect(formatIngredientAmount({ ...carrot, amount: 1.5, unit: 'l' })).toBe('1,5 l')
    expect(formatIngredientAmount({ ...carrot, amount: 0.25, unit: null })).toBe('¼')
    expect(formatIngredientAmount({ ...carrot, amount: null })).toBe('')
  })
})
