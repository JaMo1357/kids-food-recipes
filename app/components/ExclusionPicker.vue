<template>
  <div class="space-y-6">
    <section>
      <h3 class="font-extrabold">Alergeny</h3>
      <p class="mb-2 text-sm text-muted">Recepty s vybranými alergeny se nezobrazí.</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="allergen in options.allergens"
          :key="allergen.code"
          type="button"
          class="chip"
          :class="{ 'chip-on': allergens.includes(allergen.code) }"
          :aria-pressed="allergens.includes(allergen.code)"
          @click="toggleAllergen(allergen.code)"
        >
          <span aria-hidden="true">{{ allergen.emoji }}</span>{{ allergen.name }}
        </button>
      </div>
    </section>

    <section>
      <h3 class="font-extrabold">Suroviny, které nechci vařit</h3>
      <p class="mb-2 text-sm text-muted">Třeba „Maso“ schová i všechny druhy masa.</p>
      <label class="sr-only" for="ingredient-search">Hledat surovinu</label>
      <input id="ingredient-search" v-model="term" class="field" type="search" placeholder="Hledat surovinu…" autocomplete="off">
      <ul v-if="suggestions.length" class="mt-2 overflow-hidden rounded-2xl border-2 border-line bg-paper">
        <li v-for="ingredient in suggestions" :key="ingredient.slug" class="border-b border-line last:border-0">
          <button type="button" class="min-h-12 w-full px-4 text-left font-semibold hover:bg-peach-soft" @click="addIngredient(ingredient.slug)">
            {{ ingredient.name }}
          </button>
        </li>
      </ul>
      <div v-if="ingredients.length" class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="slug in ingredients"
          :key="slug"
          type="button"
          class="chip chip-on"
          :aria-label="`Zrušit vyloučení: ${ingredientName(slug)}`"
          @click="removeIngredient(slug)"
        >
          {{ ingredientName(slug) }} <span aria-hidden="true">✕</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FilterOptions, SavedFilters } from '#shared/types/api'

const props = defineProps<{ modelValue: SavedFilters; options: FilterOptions }>()
const emit = defineEmits<{ 'update:modelValue': [value: SavedFilters] }>()

const term = ref('')
const allergens = computed(() => props.modelValue.exclude_allergens ?? [])
const ingredients = computed(() => props.modelValue.exclude_ingredients ?? [])

const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const suggestions = computed(() => {
  const needle = normalize(term.value.trim())
  if (!needle) return []
  return props.options.ingredients
    .filter((i) => !ingredients.value.includes(i.slug) && normalize(i.name).includes(needle))
    .sort((a, b) => Number(b.is_group) - Number(a.is_group))
    .slice(0, 6)
})

const ingredientName = (slug: string) => props.options.ingredients.find((i) => i.slug === slug)?.name ?? slug

function update(change: SavedFilters) {
  emit('update:modelValue', { ...props.modelValue, ...change })
}

function toggleAllergen(code: string) {
  const list = allergens.value
  update({ exclude_allergens: list.includes(code) ? list.filter((c) => c !== code) : [...list, code] })
}

function addIngredient(slug: string) {
  term.value = ''
  update({ exclude_ingredients: [...ingredients.value, slug] })
}

function removeIngredient(slug: string) {
  update({ exclude_ingredients: ingredients.value.filter((s) => s !== slug) })
}
</script>
