<template>
  <div>
    <section v-if="family.ready.value && !profile" class="card mb-4 bg-peach-soft p-5">
      <h1 class="text-2xl leading-tight font-extrabold">Co dnes uvařit pro vaše dítě?</h1>
      <p class="mt-1 text-muted">Zadejte věk a ukážeme jen recepty, které se pro něj hodí. Účet nepotřebujete.</p>
      <button type="button" class="btn-primary mt-4 w-full sm:w-auto" @click="sheetOpen = true">Nastavit věk a alergeny</button>
    </section>

    <section v-else-if="profile" class="card mb-4 p-4">
      <div v-if="family.profiles.value.length > 1" class="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        <button
          v-for="child in family.profiles.value"
          :key="child.id"
          type="button"
          class="chip"
          :class="{ 'chip-on': child.id === profile.id }"
          @click="family.setActive(child.id)"
        >
          {{ child.name || 'Dítě' }}
        </button>
      </div>
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-lg font-extrabold">
            {{ profile.name ? `${profile.name} · ` : '' }}{{ result?.age_months != null ? formatAge(result.age_months) : '…' }}
          </p>
          <p class="truncate text-sm text-muted">{{ exclusionSummary }}</p>
        </div>
        <button type="button" class="btn-soft shrink-0" @click="sheetOpen = true">Upravit</button>
      </div>
    </section>

    <label class="sr-only" for="search">Hledat recept</label>
    <input id="search" v-model="query" class="field" type="search" placeholder="Hledat recept nebo surovinu…">

    <div class="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        v-for="tag in options?.tags"
        :key="tag.slug"
        type="button"
        class="chip"
        :class="{ 'chip-on': selectedTag === tag.slug }"
        :aria-pressed="selectedTag === tag.slug"
        @click="selectedTag = selectedTag === tag.slug ? null : tag.slug"
      >
        {{ tag.name }}
      </button>
    </div>

    <p v-if="error" class="card mt-4 p-5 font-bold text-danger" role="alert">
      Recepty se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu.
    </p>

    <template v-else>
      <p class="mt-4 mb-2 text-sm font-bold text-muted" aria-live="polite">{{ countLabel }}</p>
      <div
        v-if="items.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        :class="{ invisible: !family.ready.value }"
      >
        <RecipeCard v-for="recipe in items" :key="recipe.slug" :recipe="recipe" />
      </div>

      <div v-else-if="family.ready.value && status !== 'pending'" class="card p-6 text-center">
        <p class="text-lg font-extrabold">Tady zatím nic není</p>
        <p class="mt-1 text-muted">
          <template v-if="result?.age_months != null && result.age_months < 6">
            S příkrmy se obvykle začíná mezi 4. a 6. měsícem. Jejich zavedení proberte s pediatrem.
          </template>
          <template v-else>Zkuste povolit některou surovinu nebo změnit hledání.</template>
        </p>
      </div>

      <button v-if="items.length < (result?.total ?? 0)" type="button" class="btn-ghost mt-6 w-full" :disabled="loadingMore" @click="loadMore">
        Načíst další
      </button>
    </template>

    <p class="mt-8 text-sm text-muted">
      Vždy si přečtěte etikety surovin. Filtr vychází z našich dat a nenahrazuje rady lékaře.
      <NuxtLink to="/ochrana-soukromi" class="underline">Více informací</NuxtLink>
    </p>

    <FilterSheet v-model:open="sheetOpen" :options="options" />
  </div>
</template>

<script setup lang="ts">
import type { RecipeCard as Card, SearchFilters } from '#shared/types/api'

const PAGE_SIZE = 24

const api = useRecipeApi()
const family = useFamily()
const sheetOpen = ref(false)
const query = ref('')
const debouncedQuery = ref('')
const selectedTag = ref<string | null>(null)
const extra = ref<Card[]>([])
const loadingMore = ref(false)

const profile = computed(() => family.active.value)

let timer: ReturnType<typeof setTimeout>
watch(query, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { debouncedQuery.value = value }, 250)
})

const filters = computed<SearchFilters>(() => ({
  ...profile.value?.filters,
  ...(profile.value && { birth_date: profile.value.birth_date, birth_precision: profile.value.birth_precision }),
  ...(selectedTag.value && { tags: [selectedTag.value] }),
  ...(debouncedQuery.value && { query: debouncedQuery.value }),
  limit: PAGE_SIZE,
}))

const { data: options } = await useAsyncData('filter-options', () => api.getFilterOptions())
const { data: result, status, error } = await useAsyncData('recipes', () => api.search(filters.value), { watch: [filters] })

watch(result, () => { extra.value = [] })
const items = computed(() => [...(result.value?.items ?? []), ...extra.value])

async function loadMore() {
  loadingMore.value = true
  try {
    const next = await api.search({ ...filters.value, offset: items.value.length })
    extra.value = [...extra.value, ...next.items]
  } finally {
    loadingMore.value = false
  }
}

const countLabel = computed(() => {
  const total = result.value?.total ?? 0
  if (total === 1) return '1 recept'
  return total >= 2 && total <= 4 ? `${total} recepty` : `${total} receptů`
})

const exclusionSummary = computed(() => {
  const saved = profile.value?.filters
  const names = [
    ...(saved?.exclude_allergens ?? []).map((code) => options.value?.allergens.find((a) => a.code === code)?.name ?? code),
    ...(saved?.exclude_ingredients ?? []).map((slug) => options.value?.ingredients.find((i) => i.slug === slug)?.name ?? slug),
  ]
  return names.length ? `Bez: ${names.join(', ')}` : 'Bez omezení surovin'
})
</script>
