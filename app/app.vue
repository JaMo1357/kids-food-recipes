<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const family = useFamily()
const user = useSupabaseUser()

onMounted(() => family.load())
watch(() => user.value?.sub, () => family.load())
</script>
