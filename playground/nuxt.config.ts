export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss'],
  fonts: {
    families: [
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/font.woff2' },
    ]
  },
})
