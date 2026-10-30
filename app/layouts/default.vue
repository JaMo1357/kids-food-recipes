<template>
  <div class="mx-auto flex min-h-dvh max-w-5xl flex-col">
    <header class="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
      <NuxtLink to="/" class="flex items-center gap-2 text-2xl font-extrabold">
        <img src="/favicon.svg" alt="" class="size-9">
        Lžička
      </NuxtLink>
      <nav class="hidden items-center gap-2 sm:flex" aria-label="Hlavní menu">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="chip">{{ link.label }}</NuxtLink>
      </nav>
    </header>

    <main class="flex-1 px-4 pb-28 sm:pb-10">
      <slot />
    </main>

    <footer class="hidden px-4 pb-6 text-sm text-muted sm:block">
      <NuxtLink to="/ochrana-soukromi" class="underline">Soukromí a upozornění</NuxtLink>
    </footer>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t-2 border-line bg-paper pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Hlavní menu"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex min-h-16 flex-col items-center justify-center text-sm font-bold text-muted"
        active-class="!text-coral"
      >
        <span class="text-xl" aria-hidden="true">{{ link.icon }}</span>
        {{ link.label }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const links = [
  { to: '/', label: 'Recepty', icon: '🥣' },
  { to: '/oblibene', label: 'Oblíbené', icon: '💛' },
  { to: '/profil', label: 'Profil', icon: '👶' },
]
</script>
