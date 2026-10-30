<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-extrabold">Přihlášení</h1>
    <p class="mt-1 text-muted">Děti, oblíbené recepty i fotky budete mít na všech zařízeních.</p>
    <form class="card mt-4 space-y-3 p-5" @submit.prevent="submit">
      <label class="block">
        <span class="mb-1 block text-sm font-bold">E-mail</span>
        <input v-model="email" class="field" type="email" autocomplete="email" required>
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Heslo</span>
        <input v-model="password" class="field" type="password" autocomplete="current-password" required>
      </label>
      <TurnstileWidget ref="captcha" v-model="captchaToken" />
      <p v-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="busy || !captchaToken">Přihlásit se</button>
    </form>
    <p class="mt-4 text-center"><NuxtLink to="/zapomenute-heslo" class="underline">Zapomněli jste heslo?</NuxtLink></p>
    <p class="mt-2 text-center">Nemáte účet? <NuxtLink to="/registrace" class="font-bold underline">Zaregistrujte se</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const captchaToken = ref('')
const captcha = ref<{ reset: () => void }>()
const busy = ref(false)
const error = ref('')

async function submit() {
  busy.value = true
  error.value = ''
  const { error: failure } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
    options: { captchaToken: captchaToken.value },
  })
  busy.value = false
  if (failure) {
    error.value = failure.code === 'email_not_confirmed'
      ? 'Nejdřív potvrďte e-mail. Odkaz jsme vám poslali při registraci.'
      : 'E-mail nebo heslo nesedí.'
    captcha.value?.reset()
    return
  }
  await navigateTo('/')
}
</script>
