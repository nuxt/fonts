export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  css: ['~/assets/global.css'],
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'MultiCustom', src: '/multi-regular.woff2', weight: 400 },
      { name: 'MultiCustom', src: '/multi-black.woff2', weight: 900 },
      { name: 'CustomGlobal', global: true, src: '/custom-font.woff2' },
      { name: 'MultiGlobal', global: true, src: '/multi-regular.woff2', weight: 400 },
      { name: 'MultiGlobal', src: '/multi-black.woff2', weight: 900 },
    ],
  },
})
