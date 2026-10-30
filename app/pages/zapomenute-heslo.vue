<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-extrabold">Zapomenuté heslo</h1>
    <p v-if="sent" class="card mt-4 bg-sage p-5">Pokud u nás účet s tímto e-mailem máte, poslali jsme na něj odkaz pro nastavení nového hesla.</p>
    <form v-else class="card mt-4 space-y-3 p-5" @submit.prevent="submit">
      <label class="block">
        <span class="mb-1 block text-sm font-bold">E-mail</span>
        <input v-model="email" class="field" type="email" autocomplete="email" required>
      </label>
      <TurnstileWidget ref="captcha" v-model="captchaToken" />
      <p v-if="failed" class="text-sm font-bold text-danger" role="alert">Něco se nepovedlo. Zkuste to prosím znovu.</p>
      <button class="btn-primary w-full" :disabled="busy || !captchaToken">Poslat odkaz</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const captchaToken = ref('')
const captcha = ref<{ reset: () => void }>()
const busy = ref(false)
const failed = ref(false)
const sent = ref(false)

async function submit() {
  busy.value = true
  failed.value = false
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    captchaToken: captchaToken.value,
    redirectTo: `${location.origin}/nove-heslo`,
  })
  busy.value = false
  if (error) {
    failed.value = true
    captcha.value?.reset()
    return
  }
  sent.value = true
}
</script>
