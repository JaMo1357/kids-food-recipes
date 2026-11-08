<template>
  <article class="recipe-card card relative flex h-full flex-col overflow-hidden">
    <NuxtLink :to="`/recept/${recipe.slug}`" class="flex flex-1 flex-col transition-transform active:scale-[0.98]">
    <img :src="recipeImageUrl(recipe)" alt="" class="aspect-[4/3] w-full shrink-0 object-cover" loading="lazy">
    <div class="flex flex-1 flex-col p-4">
      <h3 class="text-lg leading-snug font-extrabold">{{ recipe.title }}</h3>
      <p class="mt-1 text-sm text-muted">{{ recipe.description }}</p>
      <p class="mt-auto flex flex-wrap gap-2 pt-3 text-sm font-bold">
        <span class="rounded-full bg-sage px-3 py-1 text-sage-deep">{{ formatMinAge(recipe.min_age_months) }}</span>
        <span class="rounded-full bg-butter px-3 py-1">{{ recipe.prep_minutes }} min</span>
      </p>
    </div>
    </NuxtLink>
    <RecipeShare :slug="recipe.slug" :title="recipe.title" class="recipe-card-share absolute top-3 right-3 max-w-[calc(100%-1.5rem)] rounded-3xl bg-paper text-right shadow" />
  </article>
</template>

<script setup lang="ts">
import type { RecipeCard } from '#shared/types/api'

defineProps<{ recipe: Pick<RecipeCard, 'slug' | 'title' | 'description' | 'min_age_months' | 'prep_minutes' | 'illustration' | 'image_path'> }>()
</script>

<style scoped>
.recipe-card-share {
  transition: opacity 150ms ease;
}

.recipe-card-share :deep(p),
.recipe-card-share :deep(input) {
  margin: 0.5rem;
  width: calc(100% - 1rem);
}

@media (min-width: 1024px) {
  .recipe-card-share :deep(button) {
    min-height: 2rem;
    padding-inline: 0.75rem;
    gap: 0.375rem;
    font-size: 0.75rem;
  }

  .recipe-card-share :deep(button svg) {
    width: 1rem;
    height: 1rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .recipe-card-share {
    opacity: 0;
    pointer-events: none;
  }

  .recipe-card:hover .recipe-card-share,
  .recipe-card:focus-within .recipe-card-share {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
