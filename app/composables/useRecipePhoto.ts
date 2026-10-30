const MAX_SIDE = 1400

// Re-encoding also strips EXIF data, so no location leaves the parent's phone.
async function toResizedJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Image encoding failed'))), 'image/jpeg', 0.85)
  })
}

// A parent's own photo of a recipe, visible only to them.
export function useRecipePhoto(recipeId: Ref<number | undefined>) {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const url = ref<string | null>(null)
  const busy = ref(false)

  const userId = computed(() => user.value?.sub ?? (user.value as { id?: string } | null)?.id)

  async function refresh() {
    url.value = null
    if (!userId.value || !recipeId.value) return
    const { data } = await supabase
      .from('user_recipe_photos' as never)
      .select('storage_path')
      .eq('recipe_id', recipeId.value)
      .maybeSingle()
    const path = (data as { storage_path: string } | null)?.storage_path
    if (!path) return
    const signed = await supabase.storage.from('user-photos').createSignedUrl(path, 3600)
    url.value = signed.data?.signedUrl ?? null
  }

  async function upload(file: File) {
    if (!userId.value || !recipeId.value) return
    busy.value = true
    try {
      const path = `${userId.value}/${recipeId.value}.jpg`
      const blob = await toResizedJpeg(file)
      const stored = await supabase.storage.from('user-photos').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (stored.error) throw stored.error
      const saved = await supabase
        .from('user_recipe_photos' as never)
        .upsert({ recipe_id: recipeId.value, storage_path: path } as never, { onConflict: 'user_id,recipe_id' })
      if (saved.error) throw saved.error
      await refresh()
    } finally {
      busy.value = false
    }
  }

  async function remove() {
    if (!userId.value || !recipeId.value) return
    busy.value = true
    try {
      await supabase.storage.from('user-photos').remove([`${userId.value}/${recipeId.value}.jpg`])
      const { error } = await supabase.from('user_recipe_photos' as never).delete().eq('recipe_id', recipeId.value)
      if (error) throw error
      url.value = null
    } finally {
      busy.value = false
    }
  }

  return { url, busy, refresh, upload, remove }
}
