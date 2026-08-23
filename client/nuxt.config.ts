import { createResolver } from '@nuxt/kit'
import { DEVTOOLS_UI_PATH } from '../src/constants'

const resolver = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: ['@unocss/nuxt'],
  ssr: false,
  app: {
    baseURL: DEVTOOLS_UI_PATH,
    head: {
      htmlAttrs: { 'data-syntax-theme': 'min' },
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    'microlighter/themes/min.css',
    resolver.resolve('./assets/styles.css'),
  ],
  compatibilityDate: '2024-08-19',
  nitro: {
    output: {
      publicDir: resolver.resolve('../dist/client'),
    },
  },
  vite: {
    // microlighter loads TextMate grammars with `import(`./grammars/${lang}.js`)`. Dep pre-bundling
    // rewrites that to a path with no grammars beside it, and the dynamic-import-vars transform
    // skips `node_modules`, so the grammar chunks are never emitted. Both failures are swallowed by
    // microlighter's `catch`, leaving code blocks silently unhighlighted.
    optimizeDeps: { exclude: ['microlighter'] },
    build: { dynamicImportVarsOptions: { exclude: [] } },
  },
})
