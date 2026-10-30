<template>
  <div class="mx-auto max-w-md pt-10 text-center">
    <p class="text-lg font-extrabold">{{ failed ? 'Odkaz už neplatí.' : 'Potvrzujeme váš e-mail…' }}</p>
    <NuxtLink v-if="failed" to="/prihlaseni" class="btn-primary mt-4">Na přihlášení</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const failed = ref(false)

// supabase-js reads the code from the URL on its own; we only wait for the result.
watch(user, (value) => { if (value) navigateTo('/') }, { immediate: true })
onMounted(() => setTimeout(() => { failed.value = !user.value }, 5000))
</script>
