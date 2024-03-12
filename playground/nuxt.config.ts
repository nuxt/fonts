export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxtjs/tailwindcss', '@unocss/nuxt'],
  unocss: {
    disableNuxtInlineStyle: false,
  },
  fonts: {
    experimental: { addPreloadLinks: true },
    providers: {
      custom: '~/providers/custom'
    },
    families: [
      { name: 'Abel', provider: 'bunny' },
      { name: 'Satoshi', provider: 'fontshare' },
      { name: 'Kode Mono', provider: 'none' },
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/font-global.woff2' },
      { name: 'Oswald', fallbacks: ['Times New Roman'] },
      { name: 'Aleo', provider: 'adobe'},
      { name: 'Barlow Semi Condensed', provider: 'adobe' }
    ],
    adobe: {
      id: ['sij5ufr', 'grx7wdj'],
    },
    defaults: {
      fallbacks: {
        monospace: ['Tahoma']
      }
    }
  },
})
