import { describe, expect, it } from 'vitest'
import { birthDateFromAge, formatAge, formatMinAge, isValidBirthDate } from '../shared/utils/age'

describe('formatAge', () => {
  it.each([
    [1, '1 měsíc'],
    [3, '3 měsíce'],
    [9, '9 měsíců'],
    [12, '1 rok'],
    [19, '1 rok a 7 měsíců'],
    [26, '2 roky a 2 měsíce'],
    [60, '5 let'],
  ])('%i months', (months, text) => expect(formatAge(months)).toBe(text))
})

describe('formatMinAge', () => {
  it.each([
    [6, 'od 6 měsíců'],
    [12, 'od 1 roku'],
    [18, 'od 18 měsíců'],
    [24, 'od 2 let'],
  ])('%i months', (months, text) => expect(formatMinAge(months)).toBe(text))
})

describe('birthDateFromAge', () => {
  it('goes back whole months', () => {
    expect(birthDateFromAge(9, new Date(2026, 9, 30))).toBe('2026-01-30')
  })
  it('clamps to the end of a shorter month', () => {
    expect(birthDateFromAge(8, new Date(2026, 9, 30))).toBe('2026-02-28')
  })
})

describe('isValidBirthDate', () => {
  const today = new Date(2026, 9, 30)
  it('rejects the future, nonsense and adults', () => {
    expect(isValidBirthDate('2027-01-01', today)).toBe(false)
    expect(isValidBirthDate('nope', today)).toBe(false)
    expect(isValidBirthDate('2000-01-01', today)).toBe(false)
  })
  it('accepts a child', () => {
    expect(isValidBirthDate('2025-03-14', today)).toBe(true)
  })
})
