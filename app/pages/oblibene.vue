<template>
  <div>
    <h1 class="text-3xl font-extrabold">Oblíbené</h1>
    <div v-if="!user" class="card mt-4 p-5">
      <p>Oblíbené recepty si můžete ukládat s účtem.</p>
      <NuxtLink to="/registrace" class="btn-primary mt-3">Vytvořit účet</NuxtLink>
    </div>
    <p v-else-if="loaded && !recipes.length" class="card mt-4 p-5">Zatím tu nic není. U receptu klepněte na srdíčko.</p>
    <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RecipeCard v-for="recipe in recipes" :key="recipe.slug" :recipe="recipe" />
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const favorites = useFavorites()
const recipes = ref<Awaited<ReturnType<typeof favorites.list>>>([])
const loaded = ref(false)

watch(user, async (value) => {
  if (!value) return
  recipes.value = await favorites.list()
  loaded.value = true
}, { immediate: true })
</script>
