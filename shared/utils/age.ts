const monthsLabel = (n: number) => (n === 1 ? 'měsíc' : n >= 2 && n <= 4 ? 'měsíce' : 'měsíců')
const yearsLabel = (n: number) => (n === 1 ? 'rok' : n >= 2 && n <= 4 ? 'roky' : 'let')

// 19 → "1 rok a 7 měsíců"
export function formatAge(totalMonths: number): string {
  if (totalMonths < 12) return `${totalMonths} ${monthsLabel(totalMonths)}`
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const yearsText = `${years} ${yearsLabel(years)}`
  return months ? `${yearsText} a ${months} ${monthsLabel(months)}` : yearsText
}

// 18 → "od 18 měsíců", 24 → "od 2 let"
export function formatMinAge(months: number): string {
  if (months === 12) return 'od 1 roku'
  if (months >= 24 && months % 12 === 0) return `od ${months / 12} let`
  return months === 1 ? 'od 1 měsíce' : `od ${months} měsíců`
}

// Birth date that gives exactly the given age today, for parents who only state
// the age. Stored with 'day' precision, so the age keeps growing from here.
export function birthDateFromAge(totalMonths: number, today = new Date()): string {
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))
  date.setUTCMonth(date.getUTCMonth() - totalMonths)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(today.getDate(), lastDay))
  return date.toISOString().slice(0, 10)
}

export function isValidBirthDate(value: string, today = new Date()): boolean {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return false
  const age = today.getFullYear() - date.getUTCFullYear()
  return date.getTime() <= today.getTime() && age <= 18
}
