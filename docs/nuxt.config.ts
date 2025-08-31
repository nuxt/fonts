export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['@nuxtjs/plausible'],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Nuxt Fonts',
  },
  compatibilityDate: '2025-08-07',
  llms: {
    domain: 'https://fonts.nuxt.com',
    description: 'Nuxt Fonts is a module for Nuxt to optimize fonts for best performance.',
  },
})
