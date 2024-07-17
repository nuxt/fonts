<script setup>
import { useClipboard } from '@vueuse/core'

definePageMeta({
  colorMode: 'dark',
})
const title = 'Nuxt Fonts: Optimized Custom Web Fonts for your Nuxt Apps'
const description = 'Plug-and-play custom web font optimization and configuration for Nuxt apps. Use and optimize your fonts using your favorite fonts CDN.'
useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: 'https://fonts.nuxt.com/social-card.png',
  twitterImage: 'https://fonts.nuxt.com/social-card.png',
})
const source = ref('npx nuxi module add fonts')
const { copy, copied } = useClipboard({ source })

// const providers = ['google', 'bunny', 'adobe', 'fontshare', 'fontsource']
// Disabling because svg to png does not work now with SSG
// Related issue: https://github.com/unjs/ipx/issues/160
// const img = useImage()
</script>

<template>
  <div>
    <span class="gradient" />
    <ULandingHero
      orientation="horizontal"
      :ui="{ container: 'flex lg:gap-12' }"
    >
      <TheIllustration class="hidden lg:block h-64" />
      <template #title>
        Custom Web Fonts for <br><span class="text-primary-400">Nuxt Applications</span>
      </template>
      <template #description>
        Plug-and-play fonts optimization for Nuxt apps. Use and optimize your fonts using your favorite fonts CDN.
      </template>
      <template #links>
        <UButton
          to="/get-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get started
        </UButton>
        <UInput
          aria-label="Copy code to get started"
          :model-value="source"
          name="get-started"
          disabled
          autocomplete="off"
          size="xl"
          :ui="{ base: 'w-[300px] disabled:cursor-default', icon: { trailing: { pointer: '' } } }"
        >
          <template #leading>
            <UIcon name="i-ph-terminal" />
          </template>
          <template #trailing>
            <UButton
              aria-label="Copy Code"
              :color="copied ? 'green' : 'gray'"
              variant="ghost"
              :padded="false"
              :icon="copied ? 'i-ph-check-square-duotone' : 'i-ph-copy-duotone'"
              @click="copy(source)"
            />
          </template>
        </UInput>
      </template>
    </ULandingHero>
    <ULandingSection>
      <template #title>
        Get the most of your fonts with<br><span class="text-primary-400">dynamic features</span>
      </template>
      <UPageGrid>
        <ULandingCard
          to="/get-started/configuration"
          title="Zero Configuration Required"
          icon="i-ph-note-pencil"
        >
          <template #description>
            One single <code>font-family:</code> declaration, let us manage the rest.
          </template>
        </ULandingCard>
        <ULandingCard
          to="/get-started/providers"
          title="6 Providers Supported"
          icon="i-ph-plug-duotone"
          description="Choose over 6 font providers to download your fonts, no vendor lock-in."
        />
        <ULandingCard
          to="/get-started/providers"
          title="Custom Providers for Full Control"
          icon="i-ph-user-circle-duotone"
          description="Get full control over what you need. You can create custom providers by yourself."
        />
        <ULandingCard
          to="/advanced#how-it-works"
          title="Local Download Support"
          icon="i-ph-download-duotone"
          description="Font files are automatically downloaded for production usage. No other requests to your providers."
        />
        <ULandingCard
          to="/advanced#how-it-works"
          title="Automatic Font Metric Optimisation"
          icon="i-ph-magic-wand-duotone"
          description="Unlock the power of our built-in font optimizer with fontaine and capsize."
        />
        <ULandingCard
          to="/get-started/installation"
          title="Automatic Font Caching"
          icon="i-ph-rocket-launch-duotone"
          description="Build/Dev time font caching powered by unstorage."
        />
      </UPageGrid>
    </ULandingSection>
    <ULandingSection>
      <template #title>
        Choose your <span class="text-primary-400">favorite provider</span>
      </template>
      <template #description>
        Providers are integrations between Nuxt Fonts and third-party fonts CDN. Each provider is
        responsible for downloading and caching fonts from different providers. Nuxt Font can also be configured
        to work with any external image transformation service, or to work with custom providers.
      </template>
      <template #links>
        <UButton
          to="/get-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get Started
        </UButton>
      </template>
      <!-- <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        <NuxtLink
          v-for="(provider, index) in providers"
          :key="index"
          :to="`/providers/${provider}`"
          :title="provider"
          class="block lg:hover:scale-110 transition"
        > -->
      <!-- <NuxtImg :placeholder="img(`/providers/${provider}.svg`, { h: 10, f: 'png', blur: 2, q: 50 })" :src="`/providers/${provider}.svg`" :alt="provider" width="64" height="64" class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" loading="lazy" /> -->
      <!--          <NuxtImg -->
      <!--            :src="`/providers/${provider}.svg`" -->
      <!--            :alt="provider" -->
      <!--            width="64" -->
      <!--            height="64" -->
      <!--            class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" -->
      <!--            loading="lazy" -->
      <!--          /> -->
      <!-- </NuxtLink>
      </div> -->
    </ULandingSection>
  </div>
</template>

<style scoped>
.gradient {
  position: fixed;
  top: 25vh;
  width: 100%;
  height: 30vh;
  background: radial-gradient(50% 50% at 50% 50%, #00DC82 0%, rgba(0, 220, 130, 0) 100%);
  filter: blur(180px);
  opacity: 0.6;
  z-index: -1;
}
</style>
