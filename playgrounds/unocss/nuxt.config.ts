export default defineNuxtConfig({
  modules: ['@nuxt/fonts', '@unocss/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-08-19',
  // TODO: remove when nuxt v4.6.1 is released (https://github.com/nuxt/nuxt/issues/36467)
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  unocss: {
    disableNuxtInlineStyle: false,
  },
})
