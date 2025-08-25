<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const nav = computed(() => ([
  {
    title: 'Documentation',
    icon: 'i-heroicons-book-open-solid',
    path: '/get-started/installation',
    children: navigation!.value,
  },
  {
    title: 'Playground',
    icon: 'i-ph-play-duotone',
    children: [{
      title: 'Basic',
      icon: 'vscode-icons:file-type-css',
      to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/basic',
    }, {
      title: 'SCSS',
      icon: 'vscode-icons:file-type-scss',
      to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/scss',
    }, {
      title: 'Tailwind CSS (v3)',
      icon: 'vscode-icons:file-type-tailwind',
      to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/tailwindcss@3',
    }, {
      title: 'Tailwind CSS (v4)',
      icon: 'vscode-icons:file-type-tailwind',
      to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/tailwindcss@4',
    }, {
      title: 'UnoCSS',
      icon: 'vscode-icons:file-type-unocss',
      to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/unocss',
    }],
  },
  {
    title: 'Releases',
    icon: 'i-heroicons-rocket-launch-solid',
    path: 'https://github.com/nuxt/fonts/releases',
    target: '_blank',
  },
]))
</script>

<template>
  <UContentNavigation
    highlight
    variant="link"
    :navigation="nav"
  />
</template>
