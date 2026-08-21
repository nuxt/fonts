import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  devtools: { enabled: true },
  compatibilityDate: '2024-08-19',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
