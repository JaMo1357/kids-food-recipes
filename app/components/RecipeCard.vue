<template>
  <NuxtLink :to="`/recept/${recipe.slug}`" class="card block overflow-hidden transition-transform active:scale-[0.98]">
    <img :src="recipeImageUrl(recipe)" alt="" class="aspect-[4/3] w-full object-cover" loading="lazy">
    <div class="p-4">
      <h3 class="text-lg leading-snug font-extrabold">{{ recipe.title }}</h3>
      <p class="mt-1 text-sm text-muted">{{ recipe.description }}</p>
      <p class="mt-3 flex flex-wrap gap-2 text-sm font-bold">
        <span class="rounded-full bg-sage px-3 py-1 text-sage-deep">{{ formatMinAge(recipe.min_age_months) }}</span>
        <span class="rounded-full bg-butter px-3 py-1">{{ recipe.prep_minutes }} min</span>
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { RecipeCard } from '#shared/types/api'

defineProps<{ recipe: Pick<RecipeCard, 'slug' | 'title' | 'description' | 'min_age_months' | 'prep_minutes' | 'illustration' | 'image_path'> }>()
</script>
