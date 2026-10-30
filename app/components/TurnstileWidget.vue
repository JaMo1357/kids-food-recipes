<template>
  <div ref="container" class="min-h-[65px]" />
</template>

<script setup lang="ts">
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

const token = defineModel<string>({ default: '' })
const container = ref<HTMLElement>()
const { turnstileSiteKey } = useRuntimeConfig().public
let widgetId: string | undefined

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve()
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  await loadScript()
  if (!container.value) return
  widgetId = window.turnstile!.render(container.value, {
    sitekey: turnstileSiteKey,
    language: 'cs',
    theme: 'light',
    callback: (value: string) => { token.value = value },
    'expired-callback': () => { token.value = '' },
    'error-callback': () => { token.value = '' },
  })
})

onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})

// A token works only once, so a failed submit needs a new one.
function reset() {
  token.value = ''
  if (widgetId) window.turnstile?.reset(widgetId)
}

defineExpose({ reset })
</script>
