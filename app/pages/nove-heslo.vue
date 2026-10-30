<template>
  <div class="mx-auto max-w-md">
    <h1 class="text-3xl font-extrabold">Nové heslo</h1>
    <form class="card mt-4 space-y-3 p-5" @submit.prevent="submit">
      <label class="block">
        <span class="mb-1 block text-sm font-bold">Nové heslo (alespoň 8 znaků)</span>
        <input v-model="password" class="field" type="password" autocomplete="new-password" minlength="8" required>
      </label>
      <p v-if="failed" class="text-sm font-bold text-danger" role="alert">Odkaz už nejspíš vypršel. Požádejte o nový.</p>
      <button class="btn-primary w-full" :disabled="busy">Uložit heslo</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const password = ref('')
const busy = ref(false)
const failed = ref(false)

async function submit() {
  busy.value = true
  failed.value = false
  const { error } = await supabase.auth.updateUser({ password: password.value })
  busy.value = false
  if (error) failed.value = true
  else await navigateTo('/')
}
</script>
