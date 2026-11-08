<template>
  <div>
    <button type="button" class="btn-ghost text-sm" :disabled="busy" :aria-label="`Sdílet recept ${title}`" @click="share">
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
      </svg>
      Sdílet
    </button>
    <p v-if="message" class="mt-2 text-sm font-bold" role="status">{{ message }}</p>
    <input v-if="manualUrl" :value="manualUrl" readonly aria-label="Odkaz na recept ke zkopírování" class="field mt-2 text-sm" @focus="selectUrl">
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ slug: string; title: string }>()
const busy = ref(false)
const message = ref('')
const manualUrl = ref('')

function selectUrl(event: FocusEvent) {
  (event.target as HTMLInputElement).select()
}

async function share() {
  if (busy.value) return
  busy.value = true
  message.value = ''
  manualUrl.value = ''
  const url = new URL(`/recept/${encodeURIComponent(props.slug)}`, window.location.origin).href
  try {
    if (navigator.share) {
      try {
        await navigator.share({ title: props.title, url })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      message.value = 'Odkaz je zkopírovaný.'
    } catch {
      manualUrl.value = url
      message.value = 'Označte a zkopírujte odkaz níže.'
    }
  } finally {
    busy.value = false
  }
}
</script>
