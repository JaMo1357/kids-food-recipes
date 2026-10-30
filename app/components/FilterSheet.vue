<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center" @click.self="close">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        class="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-cream sm:rounded-3xl"
      >
        <div class="flex items-center justify-between p-4">
          <h2 id="filter-title" class="text-xl font-extrabold">Nastavení pro dítě</h2>
          <button type="button" class="size-11 rounded-full bg-peach-soft text-lg font-bold" aria-label="Zavřít" @click="close">✕</button>
        </div>
        <div class="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <AgePicker v-model="birth" />
          <ExclusionPicker v-if="options" v-model="filters" :options="options" />
        </div>
        <div class="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" class="btn-primary w-full" :disabled="!birth || saving" @click="save">Zobrazit recepty</button>
          <p v-if="failed" class="mt-2 text-sm font-bold text-danger" role="alert">Nepodařilo se uložit. Zkuste to prosím znovu.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { FilterOptions, SavedFilters } from '#shared/types/api'
import type { BirthValue } from './AgePicker.vue'

defineProps<{ options: FilterOptions | null | undefined }>()
const open = defineModel<boolean>('open', { required: true })

const family = useFamily()
const birth = ref<BirthValue | null>(null)
const filters = ref<SavedFilters>({})
const saving = ref(false)
const failed = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  const profile = family.active.value
  birth.value = profile ? { birth_date: profile.birth_date, birth_precision: profile.birth_precision } : null
  filters.value = { ...profile?.filters }
  failed.value = false
})

function close() {
  open.value = false
}

async function save() {
  if (!birth.value) return
  saving.value = true
  failed.value = false
  try {
    const profile = family.active.value
    await family.saveProfile({ id: profile?.id, name: profile?.name ?? null, ...birth.value, filters: filters.value })
    close()
  } catch {
    failed.value = true
  } finally {
    saving.value = false
  }
}
</script>
