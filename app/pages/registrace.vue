<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-extrabold">Registrace</h1>
    <p class="mt-1 text-muted">Recepty fungují i bez účtu. S účtem si uložíte děti, oblíbené recepty a vlastní fotky.</p>

    <div v-if="done" class="card mt-4 bg-sage p-5">
      <p class="font-extrabold">Skoro hotovo!</p>
      <p class="mt-1">Poslali jsme vám e-mail s potvrzovacím odkazem. Po kliknutí se můžete přihlásit.</p>
    </div>

    <form v-else class="card mt-4 space-y-3 p-5" @submit.prevent="submit">
      <label class="block">
        <span class="mb-1 block text-sm font-bold">E-mail</span>
        <input v-model="email" class="field" type="email" autocomplete="email" required>
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Heslo (alespoň 8 znaků)</span>
        <input v-model="password" class="field" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <label class="flex items-start gap-3 text-sm">
        <input v-model="consent" type="checkbox" class="mt-0.5 size-5" required>
        <span>Souhlasím se <NuxtLink to="/ochrana-soukromi" class="underline">zpracováním údajů</NuxtLink>, včetně data narození dítěte.</span>
      </label>
      <TurnstileWidget ref="captcha" v-model="captchaToken" />
      <p v-if="error" class="text-sm font-bold text-danger" role="alert">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="busy || !captchaToken">Vytvořit účet</button>
    </form>
    <p class="mt-4 text-center">Už účet máte? <NuxtLink to="/prihlaseni" class="font-bold underline">Přihlaste se</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const consent = ref(false)
const captchaToken = ref('')
const captcha = ref<{ reset: () => void }>()
const busy = ref(false)
const error = ref('')
const done = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  const { data, error: failure } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      captchaToken: captchaToken.value,
      emailRedirectTo: `${location.origin}/auth/potvrzeni`,
    },
  })
  busy.value = false
  if (failure) {
    error.value = failure.code === 'weak_password'
      ? 'Heslo je příliš slabé. Zkuste delší.'
      : 'Registrace se nepovedla. Zkuste to prosím znovu.'
    captcha.value?.reset()
    return
  }
  if (data.session) await navigateTo('/')
  else done.value = true
}
</script>
