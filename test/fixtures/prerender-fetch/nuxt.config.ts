export default defineNuxtConfig({
  modules: [
    '../../../src/module',
    // expose the served font paths to the prerendered route
    (_, nuxt) => {
      const urls = new Set<string>()
      nuxt.hook('fonts:resolved', (font) => {
        for (const file of font.files) {
          urls.add(file.url)
        }
      })
      nuxt.options.nitro.virtual ||= {}
      nuxt.options.nitro.virtual['#font-urls'] = () => `export default ${JSON.stringify([...urls])}`
    },
  ],
  compatibilityDate: '2024-08-19',
  nitro: {
    prerender: {
      routes: ['/font-sizes.json'],
    },
  },
  fonts: {
    local: {
      dirs: ['fonts'],
    },
    families: [
      { name: 'MyGlobal', provider: 'local', global: true },
    ],
  },
})
