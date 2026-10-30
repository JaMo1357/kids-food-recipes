import tailwindcss from '@tailwindcss/vite'

// `pnpm generate:mobile` builds a static SPA for wrapping in Capacitor. A native
// app has no Nuxt server, so nothing here may depend on server routes.
const isMobileBuild = process.env.MOBILE_BUILD === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  ssr: !isMobileBuild,
  modules: ['@nuxtjs/supabase'],
  css: ['@fontsource-variable/nunito', '~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  supabase: {
    // Browsing without an account is a core feature; pages that need one
    // redirect on their own.
    redirect: false,
    useSsrCookies: !isMobileBuild,
    types: false,
  },
  runtimeConfig: {
    public: {
      turnstileSiteKey: '',
    },
  },
  routeRules: {
    '/auth/**': { ssr: false },
    '/nove-heslo': { ssr: false },
    '/profil': { ssr: false },
    '/oblibene': { ssr: false },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'cs' },
      title: 'Lžička – recepty pro malé jedlíky',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Jednoduché recepty pro děti podle věku. Vyřaďte alergeny i suroviny, které nechcete vařit.' },
        { name: 'theme-color', content: '#FFF8F0' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
