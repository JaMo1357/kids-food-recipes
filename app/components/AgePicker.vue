<template>
  <fieldset>
    <legend class="sr-only">Jak chcete zadat věk dítěte</legend>
    <div class="grid grid-cols-3 gap-1 rounded-2xl bg-peach-soft p-1">
      <button
        v-for="option in modes"
        :key="option.id"
        type="button"
        class="min-h-11 rounded-xl px-1 text-sm font-bold"
        :class="mode === option.id ? 'bg-paper shadow-sm' : 'text-muted'"
        :aria-pressed="mode === option.id"
        @click="mode = option.id"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="mt-3">
      <label v-if="mode === 'day'" class="block">
        <span class="mb-1 block text-sm font-bold">Datum narození</span>
        <input v-model="day" type="date" class="field" :max="todayIso">
      </label>

      <div v-else-if="mode === 'month'" class="grid grid-cols-2 gap-2">
        <label>
          <span class="mb-1 block text-sm font-bold">Měsíc narození</span>
          <select v-model.number="month" class="field">
            <option :value="null" disabled>Vyberte</option>
            <option v-for="(name, index) in monthNames" :key="name" :value="index + 1">{{ name }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-sm font-bold">Rok</span>
          <select v-model.number="year" class="field">
            <option :value="null" disabled>Vyberte</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
      </div>

      <div v-else class="grid grid-cols-2 gap-2">
        <label>
          <span class="mb-1 block text-sm font-bold">Roky</span>
          <select v-model.number="ageYears" class="field">
            <option v-for="y in 13" :key="y" :value="y - 1">{{ y - 1 }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-sm font-bold">Měsíce</span>
          <select v-model.number="ageMonths" class="field">
            <option v-for="m in 12" :key="m" :value="m - 1">{{ m - 1 }}</option>
          </select>
        </label>
      </div>

      <p v-if="error" class="mt-2 text-sm font-bold text-danger" role="alert">{{ error }}</p>
      <p v-else-if="mode === 'month'" class="mt-2 text-sm text-muted">Přesný den nepotřebujeme. Počítáme s nejmladším možným věkem, aby se recept neobjevil moc brzy.</p>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { BirthPrecision } from '#shared/types/api'

export interface BirthValue {
  birth_date: string
  birth_precision: BirthPrecision
}

const props = defineProps<{ modelValue: BirthValue | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: BirthValue | null] }>()

const modes = [
  { id: 'month', label: 'Měsíc a rok' },
  { id: 'day', label: 'Přesné datum' },
  { id: 'age', label: 'Jen věk' },
] as const
const monthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']

const now = new Date()
const todayIso = now.toISOString().slice(0, 10)
const years = Array.from({ length: 14 }, (_, index) => now.getFullYear() - index)

const initial = props.modelValue
const mode = ref<'day' | 'month' | 'age'>(initial?.birth_precision === 'day' ? 'day' : 'month')
const day = ref(initial?.birth_precision === 'day' ? initial.birth_date : '')
const month = ref<number | null>(initial?.birth_precision === 'month' ? Number(initial.birth_date.slice(5, 7)) : null)
const year = ref<number | null>(initial?.birth_precision === 'month' ? Number(initial.birth_date.slice(0, 4)) : null)
const ageYears = ref(0)
const ageMonths = ref(6)
const error = ref('')

const value = computed<BirthValue | null>(() => {
  if (mode.value === 'day') return day.value ? { birth_date: day.value, birth_precision: 'day' } : null
  if (mode.value === 'month') {
    if (!month.value || !year.value) return null
    return { birth_date: `${year.value}-${String(month.value).padStart(2, '0')}-01`, birth_precision: 'month' }
  }
  return { birth_date: birthDateFromAge(ageYears.value * 12 + ageMonths.value), birth_precision: 'day' }
})

watch(value, (next) => {
  error.value = ''
  if (next && !isValidBirthDate(next.birth_date)) {
    error.value = 'Toto datum nevypadá správně. Zkontrolujte ho, prosím.'
    emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', next)
}, { immediate: true })
</script>
