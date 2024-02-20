export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss'],
  fonts: {
    providers: {
      custom: '~/providers/custom'
    },
    families: [
      { name: 'Abel', provider: 'bunny' },
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/font-global.woff2' },
    ]
  },
})
