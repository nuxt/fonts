export default defineNuxtConfig({
  modules: ['../../../src/module'],
  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'NestedStyle', src: '/nested-style.woff2' },
      { name: 'InlineAttribute', src: '/inline-attribute.woff2' },
      { name: 'SvgAsset', src: '/svg-asset.woff2' },
      { name: 'SvgAssetGlobal', src: '/svg-asset-global.woff2', global: true },
    ],
  },
})
