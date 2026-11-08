<template>
  <article v-if="recipe" class="mx-auto max-w-2xl">
    <div class="mb-4 flex items-start justify-between gap-3">
      <button type="button" class="btn-ghost shrink-0 text-sm" @click="goBack">
        <span aria-hidden="true">←</span> Zpět
      </button>
      <RecipeShare :slug="recipe.slug" :title="recipe.title" class="min-w-0 text-right" />
    </div>
    <div class="relative -mx-4 sm:mx-0">
      <img :src="photo.url.value ?? recipeImageUrl(recipe)" alt="" class="aspect-[4/3] w-full object-cover sm:rounded-card">
      <button
        v-if="user"
        type="button"
        class="absolute top-3 right-3 size-12 rounded-full bg-paper text-xl shadow"
        :aria-label="favorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
        :aria-pressed="favorite"
        @click="toggleFavorite"
      >
        {{ favorite ? '💛' : '🤍' }}
      </button>
    </div>

    <h1 class="mt-4 text-3xl leading-tight font-extrabold">{{ recipe.title }}</h1>
    <p class="mt-1 text-muted">{{ recipe.description }}</p>
    <p class="mt-3 flex flex-wrap gap-2 text-sm font-bold">
      <span class="rounded-full bg-sage px-3 py-1 text-sage-deep">{{ formatMinAge(recipe.min_age_months) }}</span>
      <span class="rounded-full bg-butter px-3 py-1">{{ recipe.prep_minutes }} min</span>
      <span class="rounded-full bg-peach-soft px-3 py-1">{{ recipe.servings }}</span>
    </p>

    <p v-if="warnings.length" class="mt-4 rounded-2xl bg-danger-soft p-4 font-bold text-danger" role="alert">
      Pozor: {{ warnings.join(', ') }}
    </p>

    <section v-if="allergenNames.length" class="mt-4">
      <h2 class="text-sm font-extrabold">Obsahuje alergeny</h2>
      <p class="mt-1 flex flex-wrap gap-2">
        <span v-for="name in allergenNames" :key="name" class="rounded-full border-2 border-line bg-paper px-3 py-1 text-sm font-bold">{{ name }}</span>
      </p>
    </section>

    <RecipeShopping :key="recipe.slug" :title="recipe.title" :servings="recipe.servings" :ingredients="recipe.ingredients" />

    <section class="mt-6">
      <h2 class="text-xl font-extrabold">Postup</h2>
      <ol class="mt-2 space-y-3">
        <li v-for="(step, index) in recipe.steps" :key="index" class="flex gap-3">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-peach-soft font-extrabold" aria-hidden="true">{{ index + 1 }}</span>
          <span class="pt-0.5">{{ step }}</span>
        </li>
      </ol>
      <p v-if="recipe.tip" class="mt-4 rounded-2xl bg-butter p-4"><strong>Tip:</strong> {{ recipe.tip }}</p>
    </section>

    <section class="card mt-6 p-5">
      <h2 class="text-xl font-extrabold">Vaše fotka</h2>
      <template v-if="user">
        <p class="mt-1 text-sm text-muted">Fotku uvidíte jen vy. Nahradí obrázek u tohoto receptu.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <label class="btn-soft" :class="{ 'opacity-50': photo.busy.value }">
            {{ photo.url.value ? 'Vyměnit fotku' : 'Přidat fotku' }}
            <input type="file" accept="image/*" class="sr-only" :disabled="photo.busy.value" @change="onPhoto">
          </label>
          <button v-if="photo.url.value" type="button" class="btn-ghost" :disabled="photo.busy.value" @click="photo.remove()">Odebrat</button>
        </div>
        <p v-if="photoError" class="mt-2 text-sm font-bold text-danger" role="alert">{{ photoError }}</p>
      </template>
      <p v-else class="mt-1 text-sm text-muted">
        <NuxtLink to="/prihlaseni" class="font-bold underline">Přihlaste se</NuxtLink> a přidejte si vlastní fotku.
      </p>
    </section>

    <p v-if="recipe.source_url" class="mt-6 text-sm text-muted">
      Upraveno pro děti podle receptu:
      <a :href="recipe.source_url" class="underline" target="_blank" rel="noopener">{{ recipe.source_name }}</a>
    </p>
    <p v-if="!photo.url.value && !recipe.image_path && generatedRecipePhotos[recipe.slug]" class="mt-2 text-xs text-muted">
      Ilustrační fotografie vytvořená pomocí AI podle receptu.
    </p>
    <p v-if="credit && !photo.url.value" class="mt-2 text-xs text-muted">
      Ilustrační foto:
      <a :href="credit.sourceUrl" class="underline" target="_blank" rel="noopener">{{ credit.title }}</a>,
      autor {{ credit.author }},
      <a :href="credit.licenseUrl" class="underline" target="_blank" rel="noopener license">{{ credit.license }}</a>,
      oříznuto a zmenšeno
    </p>
  </article>
</template>

<script setup lang="ts">

const route = useRoute()
const router = useRouter()

function goBack() {
  const back = window.history.state?.back
  if (typeof back === 'string' && back.startsWith('/') && !back.startsWith('//')) {
    router.back()
  } else {
    router.push('/')
  }
}

const api = useRecipeApi()
const family = useFamily()
const favorites = useFavorites()
const user = useSupabaseUser()

const slug = route.params.slug as string
const { data: recipe } = await useAsyncData(`recipe-${slug}`, () => api.getRecipe(slug))
const { data: options } = await useAsyncData('filter-options', () => api.getFilterOptions())
if (!recipe.value) throw createError({ statusCode: 404, statusMessage: 'Recept nenalezen', fatal: true })

useHead({ title: `${recipe.value.title} – Lžička` })
useSeoMeta({ description: recipe.value.description })

const credit = computed(() => recipe.value && recipePhotoCredit(recipe.value))
const recipeId = computed(() => recipe.value?.id)
const photo = useRecipePhoto(recipeId)
const favorite = ref(false)
const photoError = ref('')

async function loadPersonal() {
  photo.refresh()
  if (recipeId.value) favorite.value = await favorites.isFavorite(recipeId.value)
}
onMounted(loadPersonal)
watch(() => user.value?.sub, loadPersonal)

const allergenNames = computed(() =>
  (recipe.value?.allergens ?? []).map((code) => options.value?.allergens.find((a) => a.code === code)?.name ?? code))

// Someone can open a recipe through a direct link, past the filters.
const age = ref<number | null>(null)
watch(family.active, async (profile) => {
  if (!profile) { age.value = null; return }
  const result = await api.search({ birth_date: profile.birth_date, birth_precision: profile.birth_precision, limit: 1 })
  age.value = result.age_months
}, { immediate: true })

const warnings = computed(() => {
  const list: string[] = []
  const profile = family.active.value
  const r = recipe.value
  if (!r || !profile) return list
  if (age.value !== null && age.value < r.min_age_months) list.push(`recept je vhodný ${formatMinAge(r.min_age_months)}`)
  const blocked = (profile.filters.exclude_allergens ?? []).filter((code) => r.allergens.includes(code))
  if (blocked.length) {
    const names = blocked.map((code) => options.value?.allergens.find((a) => a.code === code)?.name ?? code)
    list.push(`obsahuje alergen, který jste vyloučili (${names.join(', ')})`)
  }
  return list
})

async function toggleFavorite() {
  if (!recipeId.value) return
  const next = !favorite.value
  favorite.value = next
  try {
    await favorites.setFavorite(recipeId.value, next)
  } catch {
    favorite.value = !next
  }
}

async function onPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  photoError.value = ''
  try {
    await photo.upload(file)
  } catch {
    photoError.value = 'Fotku se nepodařilo nahrát. Zkuste prosím jinou.'
  }
  input.value = ''
}
</script>
