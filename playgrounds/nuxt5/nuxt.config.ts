export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  css: ['~/assets/global.css'],
  features: {
    inlineStyles: () => true,
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'Abel', provider: 'bunny' },
      { name: 'Satoshi', provider: 'fontshare' },
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'Barlow', preload: true },
      { name: 'Roboto Mono', provider: 'fontsource', preload: true },
    ],
  },
})
