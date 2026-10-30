<template>
  <div class="mx-auto max-w-lg">
    <h1 class="text-3xl font-extrabold">Profil</h1>

    <section class="mt-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-extrabold">Děti</h2>
        <button type="button" class="btn-soft" @click="startNew">Přidat dítě</button>
      </div>
      <p v-if="family.ready.value && !family.profiles.value.length" class="card mt-3 p-5 text-muted">Zatím tu nikdo není. Přidejte dítě a recepty se mu přizpůsobí.</p>
      <ul class="mt-3 space-y-3">
        <li v-for="child in family.profiles.value" :key="child.id" class="card flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="truncate font-extrabold">{{ child.name || 'Dítě' }}</p>
            <p class="text-sm text-muted">{{ birthLabel(child) }}</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button type="button" class="btn-ghost" @click="edit(child)">Upravit</button>
            <button type="button" class="btn-ghost" :aria-label="`Smazat ${child.name || 'dítě'}`" @click="family.removeProfile(child.id)">✕</button>
          </div>
        </li>
      </ul>
    </section>

    <form v-if="editing" class="card mt-4 space-y-4 p-5" @submit.prevent="save">
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Jméno nebo přezdívka (nepovinné)</span>
        <input v-model="name" class="field" maxlength="40" autocomplete="off">
      </label>
      <AgePicker :key="editing.id ?? 'new'" v-model="birth" />
      <ExclusionPicker v-if="options" v-model="filters" :options="options" />
      <p v-if="failed" class="text-sm font-bold text-danger" role="alert">Nepodařilo se uložit. Zkuste to prosím znovu.</p>
      <div class="flex gap-2">
        <button class="btn-primary flex-1" :disabled="!birth">Uložit</button>
        <button type="button" class="btn-ghost" @click="editing = null">Zrušit</button>
      </div>
    </form>

    <section class="mt-8">
      <h2 class="text-xl font-extrabold">Účet</h2>
      <div v-if="user" class="card mt-3 space-y-3 p-5">
        <p class="break-all">{{ user.email }}</p>
        <button type="button" class="btn-ghost w-full" @click="signOut">Odhlásit se</button>
        <button type="button" class="w-full text-sm font-bold text-danger underline" @click="deleteAccount">Smazat účet a všechna data</button>
        <p v-if="deleteFailed" class="text-sm font-bold text-danger" role="alert">Účet se nepodařilo smazat. Zkuste to prosím znovu.</p>
      </div>
      <div v-else class="card mt-3 p-5">
        <p class="text-muted">Teď jsou vaše údaje uložené jen v tomto prohlížeči. S účtem je budete mít všude.</p>
        <div class="mt-3 flex gap-2">
          <NuxtLink to="/registrace" class="btn-primary flex-1">Registrace</NuxtLink>
          <NuxtLink to="/prihlaseni" class="btn-ghost flex-1">Přihlášení</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ChildProfile, SavedFilters } from '#shared/types/api'
import type { BirthValue } from '~/components/AgePicker.vue'

const family = useFamily()
const api = useRecipeApi()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data: options } = await useAsyncData('filter-options', () => api.getFilterOptions())

const editing = ref<Partial<ChildProfile> | null>(null)
const name = ref('')
const birth = ref<BirthValue | null>(null)
const filters = ref<SavedFilters>({})
const failed = ref(false)
const deleteFailed = ref(false)

function birthLabel(child: ChildProfile) {
  const [year, month, day] = child.birth_date.split('-')
  return child.birth_precision === 'month' ? `narození ${Number(month)}/${year}` : `narození ${Number(day)}. ${Number(month)}. ${year}`
}

function startNew() {
  edit({})
}

function edit(child: Partial<ChildProfile>) {
  editing.value = child
  name.value = child.name ?? ''
  birth.value = child.birth_date ? { birth_date: child.birth_date, birth_precision: child.birth_precision ?? 'day' } : null
  filters.value = { ...child.filters }
  failed.value = false
}

async function save() {
  if (!birth.value) return
  failed.value = false
  try {
    await family.saveProfile({ id: editing.value?.id, name: name.value.trim() || null, ...birth.value, filters: filters.value })
    editing.value = null
  } catch {
    failed.value = true
  }
}

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/')
}

async function deleteAccount() {
  if (!confirm('Opravdu smazat účet? Děti, oblíbené recepty i fotky budou nenávratně pryč.')) return
  deleteFailed.value = false
  const { data: photos } = await supabase.from('user_recipe_photos' as never).select('storage_path')
  const paths = ((photos ?? []) as { storage_path: string }[]).map((p) => p.storage_path)
  if (paths.length) await supabase.storage.from('user-photos').remove(paths)
  const { error } = await supabase.rpc('delete_my_account' as never)
  if (error) {
    deleteFailed.value = true
    return
  }
  await supabase.auth.signOut({ scope: 'local' })
  await navigateTo('/')
}
</script>
