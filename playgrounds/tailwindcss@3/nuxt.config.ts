export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  features: {
    inlineStyles: () => true,
  },
  compatibilityDate: '2024-08-19',
})
