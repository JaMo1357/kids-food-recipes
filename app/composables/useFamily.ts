import type { ChildProfile, SavedFilters } from '#shared/types/api'

const STORAGE_KEY = 'lzicka.family.v1'

interface LocalFamily {
  profiles: ChildProfile[]
  activeId: string | null
}

function readLocal(): LocalFamily {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Blocked or corrupted storage just means starting empty.
  }
  return { profiles: [], activeId: null }
}

function writeLocal(family: LocalFamily) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(family))
  } catch {
    // Filters then only last for this visit.
  }
}

// Children and their filters. Anonymous visitors keep them in the browser,
// registered users in Supabase; the rest of the app doesn't know the difference.
export function useFamily() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profiles = useState<ChildProfile[]>('family.profiles', () => [])
  const activeId = useState<string | null>('family.activeId', () => null)
  const ready = useState('family.ready', () => false)

  const active = computed(() => profiles.value.find((p) => p.id === activeId.value) ?? profiles.value[0] ?? null)
  const isSignedIn = computed(() => !!user.value)

  function persistLocal() {
    if (!isSignedIn.value) writeLocal({ profiles: profiles.value, activeId: activeId.value })
  }

  async function load() {
    const local = readLocal()
    if (!isSignedIn.value) {
      profiles.value = local.profiles
      activeId.value = local.activeId
      ready.value = true
      return
    }
    const { data, error } = await supabase.from('children' as never).select('*').order('created_at')
    if (error) throw error
    let rows = data as unknown as ChildProfile[]
    // Carry over what the parent set up before registering.
    if (!rows.length && local.profiles.length) {
      const inserts = local.profiles.map(({ name, birth_date, birth_precision, filters }) => ({ name, birth_date, birth_precision, filters }))
      const inserted = await supabase.from('children' as never).insert(inserts as never).select('*')
      if (inserted.error) throw inserted.error
      rows = inserted.data as unknown as ChildProfile[]
      writeLocal({ profiles: [], activeId: null })
    }
    profiles.value = rows
    activeId.value = rows[0]?.id ?? null
    ready.value = true
  }

  async function saveProfile(profile: Omit<ChildProfile, 'id'> & { id?: string }) {
    const { id, name, birth_date, birth_precision, filters } = profile
    if (!isSignedIn.value) {
      const saved = { id: id ?? crypto.randomUUID(), name, birth_date, birth_precision, filters }
      profiles.value = id ? profiles.value.map((p) => (p.id === id ? saved : p)) : [...profiles.value, saved]
      activeId.value = saved.id
      persistLocal()
      return
    }
    const values = { name, birth_date, birth_precision, filters }
    const query = id
      ? supabase.from('children' as never).update(values as never).eq('id', id)
      : supabase.from('children' as never).insert(values as never)
    const { data, error } = await query.select('*').single()
    if (error) throw error
    const saved = data as unknown as ChildProfile
    profiles.value = id ? profiles.value.map((p) => (p.id === id ? saved : p)) : [...profiles.value, saved]
    activeId.value = saved.id
  }

  async function updateFilters(filters: SavedFilters) {
    if (active.value) await saveProfile({ ...active.value, filters })
  }

  async function removeProfile(id: string) {
    if (isSignedIn.value) {
      const { error } = await supabase.from('children' as never).delete().eq('id', id)
      if (error) throw error
    }
    profiles.value = profiles.value.filter((p) => p.id !== id)
    if (activeId.value === id) activeId.value = profiles.value[0]?.id ?? null
    persistLocal()
  }

  function setActive(id: string) {
    activeId.value = id
    persistLocal()
  }

  return { profiles, active, activeId, ready, isSignedIn, load, saveProfile, updateFilters, removeProfile, setActive }
}
