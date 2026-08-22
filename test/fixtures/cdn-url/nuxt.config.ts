export default defineNuxtConfig({
  modules: ['../../../src/module'],
  app: {
    cdnURL: 'https://cdn.example.com/',
  },
  css: ['~/assets/global.css'],
  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
    ],
  },
})
