export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss', '@unocss/nuxt'],
  unocss: {
    disableNuxtInlineStyle: false,
  },
  fonts: {
    experimental: { addPreloadLinks: true },
    providers: {
      custom: '~/providers/custom',
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
      { name: 'Roboto Mono', provider: 'fontsource' },
      { name: 'Recursive', provider: 'google', variableAxis: { slnt: ['-15..0'], CASL: ['0..1'], CRSV: ['0..1'], MONO: ['0..1'] } },
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
