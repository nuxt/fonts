<script setup>
import { debounce } from 'perfect-debounce'

const search = ref(null)
useServerSeoMeta({
  titleTemplate: '%s - Nuxt Fonts',
  ogSiteName: 'Nuxt Fonts',
  twitterCard: 'summary_large_image',
})
useHead({
  htmlAttrs: {
    lang: 'en',
  },
})
const links = [{
  label: 'Documentation',
  icon: 'i-heroicons-book-open-solid',
  to: '/get-started/installation',
}, {
  label: 'Playground',
  icon: 'i-ph-play-duotone',
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
  target: '_blank',
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch-solid',
  to: 'https://github.com/nuxt/fonts/releases',
  target: '_blank',
}]
const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false,
})
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

// Provide
provide('navigation', navigation)

watch(() => search.value?.commandPaletteRef?.query, debounce((query) => {
  if (!query) return
  useTrackEvent('Search', { props: { query, results: `${search.value?.commandPaletteRef.results.length}` } })
}, 500))
</script>

<template>
  <UHeader
    :links="links"
    title="Nuxt Fonts"
  >
    <template #logo>
      <AppLogo />
    </template>
    <template #right>
      <UContentSearchButton
        :label="null"
        class="hidden md:inline-flex"
      />
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://x.com/nuxt_js"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Fonts on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/fonts"
        color="gray"
        variant="ghost"
      />
    </template>
    <!-- Mobile panel -->
    <template
      v-if="$route.path !== '/'"
      #panel
    >
      <LazyUContentSearchButton
        size="md"
        class="w-full mb-4"
      />
      <LazyUNavigationTree
        :links="mapContentNavigation(navigation)"
        default-open
        :multiple="false"
      />
    </template>
  </UHeader>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UFooter :links="links">
    <template #left>
      <span class="text-sm">
        Published under <NuxtLink
          to="https://github.com/nuxt/fonts"
          target="_blank"
          class="underline"
        >
          MIT License
        </NuxtLink>
      </span>
    </template>
    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Nuxt Website"
        icon="i-simple-icons-nuxtdotjs"
        to="https://nuxt.com"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt on X"
        icon="i-simple-icons-x"
        to="https://go.nuxt.com/x"
        color="gray"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt Fonts on GitHub"
        icon="i-simple-icons-github"
        to="https://github.com/nuxt/fonts"
        color="gray"
        variant="ghost"
      />
    </template>
  </UFooter>
  <ClientOnly>
    <LazyUContentSearch
      ref="search"
      :files="files"
      :navigation="navigation"
      :links="links"
    />
  </ClientOnly>
</template>
