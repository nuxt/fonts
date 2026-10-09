export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
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
      { name: 'MultiCustom', src: '/multi-regular.woff2', weight: 400 },
      { name: 'MultiCustom', src: '/multi-black.woff2', weight: 900 },
      { name: 'CustomGlobal', global: true, src: '/custom-font.woff2' },
      { name: 'MultiGlobal', global: true, src: '/multi-regular.woff2', weight: 400 },
      { name: 'MultiGlobal', src: '/multi-black.woff2', weight: 900 },
    ],
  },
})
