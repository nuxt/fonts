// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './playground',
    ],
  },
}).append(
  {
    rules: {
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/ban-types': 'off',
    },
  },
  {
    files: ['test/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['docs/**'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
