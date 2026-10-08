export default defineNuxtConfig({
  modules: ['../../../src/module'],
  css: ['~/assets/global.css'],
  compatibilityDate: '2024-08-19',
  // TODO: remove when nuxt v4.6.1 is released (https://github.com/nuxt/nuxt/issues/36467)
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  fonts: {
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/custom-font.woff2' },
    ],
  },
})
