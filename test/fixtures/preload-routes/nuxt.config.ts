export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  css: ['~/assets/global.css'],
  routeRules: {
    '/inbox/**': { fonts: { preload: { Routed: { weights: [700] }, Styled: true } } },
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'Routed', global: true, src: '/routed-font.woff2', weight: 400 },
      { name: 'Routed', global: true, src: '/routed-font-bold.woff2', weight: 700 },
      { name: 'Everywhere', global: true, src: '/everywhere-font.woff2' },
      { name: 'Styled', src: '/styled-font.woff2' },
    ],
  },
})
