export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  compatibilityDate: '2024-08-19',
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', subsets: ['latin'], glyphs: 'abc', preload: { subsets: ['latin'] } },
    ],
  },
})
