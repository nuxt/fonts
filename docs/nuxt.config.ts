export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/plausible'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Nuxt Fonts',
  },
  compatibilityDate: '2025-08-07',
  fonts: {
    families: [
      // Subsetted families are not preloaded by default.
      {
        name: 'Public Sans',
        preload: (_family, font) => font.meta?.subset === 'latin' && font.style !== 'italic',
      },
      { name: 'Fraunces', provider: 'google', weights: [600], preload: false },
      { name: 'Bricolage Grotesque', provider: 'bunny', weights: [600], preload: false },
      { name: 'Satoshi', provider: 'fontshare', weights: [700], preload: false },
    ],
  },
  llms: {
    domain: 'https://fonts.nuxt.com',
    description: 'Nuxt Fonts is a module for Nuxt to optimize fonts for best performance.',
  },
})
