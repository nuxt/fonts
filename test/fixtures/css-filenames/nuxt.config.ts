import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: ['../../../src/module.ts'],
  css: ['~/assets/global.css'],
  compatibilityDate: '2024-08-19',
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      const options = config.build?.rolldownOptions
      if (isClient && options) {
        const input = typeof options.input === 'string' ? { entry: options.input } : options.input
        options.input = { ...input, theme: fileURLToPath(new URL('./assets/theme.css', import.meta.url)) }
      }
    },
  },
  fonts: {
    families: [
      { name: 'MyCustom', src: '/custom-font.woff2' },
      { name: 'CustomGlobal', global: true, src: '/custom-font.woff2' },
    ],
  },
})
