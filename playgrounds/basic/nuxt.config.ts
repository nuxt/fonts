export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  devtools: { enabled: true },
  compatibilityDate: '2024-08-19',
  fonts: {
    providers: {
      custom: '~/providers/custom',
      customLegacy: '~/providers/custom-legacy',
    },
    families: [
      { name: 'Abel', provider: 'bunny' },
      { name: 'Satoshi', provider: 'fontshare' },
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/font-global.woff2' },
      { name: 'Oswald', fallbacks: ['Times New Roman'] },
      { name: 'Aleo', provider: 'adobe' },
      { name: 'Barlow Semi Condensed', provider: 'adobe' },
      { name: 'Barlow', preload: true },
      { name: 'Roboto Mono', provider: 'fontsource' },
      { name: 'Roboto Flex', provider: 'fontsource' },
    ],
    adobe: {
      id: ['sij5ufr', 'grx7wdj'],
    },
    defaults: {
      fallbacks: {
        monospace: ['Tahoma'],
      },
    },
  },
})
