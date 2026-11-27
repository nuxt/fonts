export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  css: ['~/assets/main.css'],
  compatibilityDate: '2024-08-19',
  nitro: { static: true, prerender: { routes: ['/'] } },
  fonts: {
    families: [
      { name: 'MySubset', src: [new URL('./app/assets/fonts/CustomFont.woff2', import.meta.url).href], glyphs: 'Hello', preload: true },
      { name: 'Abel', provider: 'bunny' },
      { name: 'Barlow', provider: 'bunny', global: true, weights: [400], subsets: ['latin'] },
    ],
  },
  server: { builder: 'vite' },
})
