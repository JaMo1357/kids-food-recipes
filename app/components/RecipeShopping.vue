<template>
  <section class="card mt-6 p-5" aria-labelledby="shopping-heading">
    <h2 id="shopping-heading" class="text-xl font-extrabold">Suroviny a nákup</h2>
    <p class="mt-1 text-sm text-muted">Zaškrtněte, co potřebujete koupit. Co máte doma, nechte nevybrané.</p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button type="button" class="btn-ghost text-sm" @click="selected = ingredients.map(item => item.slug)">Vybrat vše</button>
      <button type="button" class="btn-ghost text-sm" :disabled="!selected.length" @click="selected = []">Zrušit výběr</button>
    </div>
    <ul class="mt-2 divide-y divide-line">
      <li v-for="ingredient in ingredients" :key="ingredient.slug">
        <label class="flex min-h-12 cursor-pointer items-center gap-3 py-3">
          <input v-model="selected" type="checkbox" :value="ingredient.slug" class="size-5 shrink-0 accent-coral">
          <span>
            <span class="font-bold">{{ formatIngredientAmount(ingredient) }}</span>
            {{ ingredient.name }}
            <span v-if="ingredient.note || ingredient.is_optional" class="text-sm text-muted">
              ({{ [ingredient.is_optional ? 'nepovinné' : null, ingredient.note].filter(Boolean).join(', ') }})
            </span>
          </span>
        </label>
      </li>
    </ul>

    <div class="mt-4 rounded-2xl bg-cream p-4">
      <h3 class="font-extrabold">Nakoupit podle seznamu</h3>
      <p class="mt-1 text-sm" role="status">Vybráno {{ chosen.length }} z {{ ingredients.length }} surovin.</p>
      <template v-if="chosen.length">
        <p class="mt-2 text-sm text-muted">Zkopírujte si seznam a otevřete obchod. Suroviny se do košíku automaticky nepřenesou; konkrétní produkty a objednávku vyberete v obchodě.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" class="btn-soft" :disabled="copying" @click="copyList">Kopírovat seznam</button>
          <button type="button" class="btn-ghost" @click="downloadList">Stáhnout seznam</button>
        </div>
        <details class="mt-3" :open="manualCopy">
          <summary class="cursor-pointer text-sm font-bold underline">Zobrazit seznam ke kopírování</summary>
          <textarea :value="listText" readonly aria-label="Nákupní seznam" class="field mt-2 min-h-40 py-3 text-sm" @focus="selectText" />
        </details>
        <fieldset class="mt-4">
          <legend class="text-sm font-extrabold">Vyberte obchod</legend>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <label v-for="store in groceryStores" :key="store.id" class="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border-2 bg-paper p-3 text-sm font-bold" :class="storeId === store.id ? 'border-coral' : 'border-line'">
              <input v-model="storeId" type="radio" name="grocery-store" :value="store.id" class="accent-coral">
              {{ store.name }}
            </label>
          </div>
        </fieldset>
        <a :href="activeStore.url" target="_blank" rel="noopener noreferrer" class="btn-primary mt-3 w-full">Otevřít {{ activeStore.name }} ↗</a>
        <p class="mt-2 text-xs text-muted">Otevře se v nové kartě. Dostupnost a doručení závisí na vaší adrese. Na foodora přejděte do sekce Obchody.</p>
      </template>
      <p v-else class="mt-2 text-sm text-muted">Pro nákupní seznam vyberte alespoň jednu surovinu.</p>
      <p v-if="message" class="mt-3 text-sm font-bold" role="status">{{ message }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RecipeIngredient } from '#shared/types/api'
import { formatIngredientAmount, groceryStores, shoppingListText } from '#shared/utils/shopping'

const props = defineProps<{ title: string; servings: string; ingredients: RecipeIngredient[] }>()
const selected = ref<string[]>([])
const storeId = ref<string>('kosik')
const copying = ref(false)
const manualCopy = ref(false)
const message = ref('')
watch(() => props.ingredients, (items) => {
  selected.value = items.filter(item => !item.is_optional).map(item => item.slug)
}, { immediate: true })
const chosen = computed(() => props.ingredients.filter(item => selected.value.includes(item.slug)))
const listText = computed(() => shoppingListText(props.title, props.servings, chosen.value))
const activeStore = computed(() => groceryStores.find(store => store.id === storeId.value) ?? groceryStores[0])
watch(listText, () => { message.value = ''; manualCopy.value = false })

function selectText(event: FocusEvent) {
  (event.target as HTMLTextAreaElement).select()
}

async function copyList() {
  if (!listText.value) return
  copying.value = true
  const text = listText.value
  try {
    await navigator.clipboard.writeText(text)
    if (text === listText.value) message.value = 'Seznam je zkopírovaný. Teď můžete otevřít obchod.'
  } catch {
    manualCopy.value = true
    message.value = 'Kopírování se nepodařilo. Označte a zkopírujte seznam v textovém poli, nebo jej stáhněte.'
  } finally {
    copying.value = false
  }
}

function downloadList() {
  if (!listText.value) return
  const url = URL.createObjectURL(new Blob(['\uFEFF', listText.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'nakupni-seznam.txt'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
