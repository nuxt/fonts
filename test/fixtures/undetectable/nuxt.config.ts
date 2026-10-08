export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2024-08-19',
  // TODO: remove when nuxt v4.6.1 is released (https://github.com/nuxt/nuxt/issues/36467)
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  fonts: {
    families: [
      { name: 'NestedStyle', src: '/nested-style.woff2' },
      { name: 'InlineAttribute', src: '/inline-attribute.woff2' },
      { name: 'SvgAsset', src: '/svg-asset.woff2' },
      { name: 'SvgAssetGlobal', src: '/svg-asset-global.woff2', global: true },
    ],
  },
})
