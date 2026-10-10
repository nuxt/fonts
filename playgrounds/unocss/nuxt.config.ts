export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@unocss/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-08-19',
  unocss: {
    disableNuxtInlineStyle: false,
  },
})
