<script setup lang="ts">
const links = [{
  label: 'Documentation',
  to: '/get-started/installation',
},
{
  label: 'Playground',
  children: [{
    label: 'Basic',
    icon: 'vscode-icons:file-type-css',
    to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/basic',
  }, {
    label: 'SCSS',
    icon: 'vscode-icons:file-type-scss',
    to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/scss',
  }, {
    label: 'Tailwind CSS (v3)',
    icon: 'vscode-icons:file-type-tailwind',
    to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/tailwindcss@3',
  }, {
    label: 'Tailwind CSS (v4)',
    icon: 'vscode-icons:file-type-tailwind',
    to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/tailwindcss@4',
  }, {
    label: 'UnoCSS',
    icon: 'vscode-icons:file-type-unocss',
    to: 'https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/unocss',
  }],
},
{
  label: 'Releases',
  to: 'https://github.com/nuxt/fonts/releases',
  target: '_blank',
}]
</script>

<template>
  <UNavigationMenu
    :items="links"
    content-orientation="vertical"
    variant="link"
  />
</template>
