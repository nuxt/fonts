// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],

  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxt/fonts',
    // TODO: reenable when it builds again
    // '@nuxthq/studio',
    'nuxt-og-image',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],

  devtools: {
    enabled: true,
  },

  routeRules: {
    '/api/search.json': { prerender: true },
  },

  compatibilityDate: '2024-07-17',

  typescript: {
    strict: false,
  },

  hooks: {
    // Define `@nuxt/ui` components as global to use them in `.md` (feel free to add those you need)
    'components:extend': (components) => {
      const globals = components.filter(c => ['UButton', 'UIcon'].includes(c.pascalName))

      globals.forEach(c => c.global = true)
    },
  },
})
