<script setup lang="ts">
const providers = [
  { name: 'local', description: 'Font files in your own public/ directory' },
  { name: 'google', description: 'Google Fonts' },
  { name: 'googleicons', description: 'Material Symbols and Google icon fonts' },
  { name: 'bunny', description: 'Bunny Fonts, a privacy-first Google Fonts mirror' },
  { name: 'fontshare', description: 'Fontshare by Indian Type Foundry' },
  { name: 'fontsource', description: 'Open-source families published to npm' },
  { name: 'npm', description: 'Any font package on npm' },
  { name: 'adobe', description: 'Adobe Fonts, with your project id' },
]
</script>

<template>
  <ul class="grid gap-x-8 sm:grid-cols-2">
    <li
      v-for="provider in providers"
      :key="provider.name"
      class="border-t border-muted"
    >
      <ULink
        :to="`/get-started/providers#${provider.name}`"
        class="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <code class="font-mono text-sm font-medium text-highlighted group-hover:text-primary">{{ provider.name }}</code>
        <span class="text-sm text-muted">{{ provider.description }}</span>
      </ULink>
    </li>
  </ul>
</template>
