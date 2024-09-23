<script setup>
import { useClipboard } from '@vueuse/core'

const title = 'Nuxt Fonts: Optimized Custom Web Fonts for your Nuxt Apps'
const description = 'Plug-and-play custom web font optimization and configuration for Nuxt apps. Use and optimize your fonts using your favorite font source.'
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
  <div class="relative">
    <HeroBackground
      class="absolute w-full top-[1px] transition-all text-primary flex-shrink-0"
    />
    <ULandingHero
      orientation="vertical"
    >
      <video
        poster="https://res.cloudinary.com/nuxt/video/upload/so_0/v1726179597/nuxt/nuxt-fonts_yuea4f.jpg"
        controls
        class="w-full sm:w-2/3 h-auto rounded mx-auto"
      >
        <source
          src="https://res.cloudinary.com/nuxt/video/upload/v1726179597/nuxt/nuxt-fonts_yuea4f.webm"
          type="video/webm"
        >
        <source
          src="https://res.cloudinary.com/nuxt/video/upload/v1726179597/nuxt/nuxt-fonts_yuea4f.mp4"
          type="video/mp4"
        >
        <source
          src="https://res.cloudinary.com/nuxt/video/upload/v1726179597/nuxt/nuxt-fonts_yuea4f.ogg"
          type="video/ogg"
        >
      </video>
      <template #title>
        Custom Web Fonts for <br><span class="text-primary-400">Nuxt Applications</span>
      </template>
      <template #description>
        Plug-and-play fonts optimization for Nuxt apps. Use and optimize your fonts using your favorite font source.
      </template>
      <template #links>
        <UButton
          to="/get-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="lg"
        >
          Get started
        </UButton>
        <UInput
          aria-label="Copy code to get started"
          :model-value="source"
          name="get-started"
          disabled
          autocomplete="off"
          size="lg"
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
              :icon="copied ? 'i-ph-check' : 'i-ph-copy'"
              @click="copy(source)"
            />
          </template>
        </UInput>
      </template>
    </ULandingHero>
    <ULandingSection class="pt-0 sm:pt-0">
      <template #title>
        Get the most of your fonts with<br><span class="text-primary-400">dynamic features</span>
      </template>
      <UPageGrid>
        <ULandingCard
          to="/get-started/configuration"
          title="Zero Configuration Required"
          icon="i-ph-sparkle-fill"
        >
          <template #description>
            One single <code>font-family:</code> declaration, let us manage the rest.
          </template>
        </ULandingCard>
        <ULandingCard
          to="/get-started/providers"
          title="6 Providers Supported"
          icon="i-ph-plug-fill"
          description="Choose over 6 font providers to download your fonts, no vendor lock-in."
        />
        <ULandingCard
          to="/get-started/providers"
          title="Custom Providers for Full Control"
          icon="i-ph-user-circle-fill"
          description="Get full control over what you need. You can create custom providers by yourself."
        />
        <ULandingCard
          to="/advanced#how-it-works"
          title="Local Download Support"
          icon="i-ph-download-fill"
          description="Font files are automatically downloaded for production usage. No other requests to your providers."
        />
        <ULandingCard
          to="/advanced#how-it-works"
          title="Automatic Font Metric Optimisation"
          icon="i-ph-magic-wand-fill"
          description="Unlock the power of our built-in font optimizer with fontaine and capsize."
        />
        <ULandingCard
          to="/get-started/installation"
          title="Automatic Font Caching"
          icon="i-ph-rocket-launch-fill"
          description="Build/Dev time font caching powered by unstorage."
        />
      </UPageGrid>
    </ULandingSection>
    <ULandingSection>
      <template #title>
        Choose your <span class="text-primary-400">favorite provider</span>
      </template>
      <template #description>
        Providers are integrations between Nuxt Fonts and third-party font sources. Each provider is
        responsible for downloading and caching fonts from different sources. You can use any one of the built-in providers, or write your own.
      </template>
      <template #links>
        <UButton
          to="/get-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="lg"
        >
          Get Started
        </UButton>
      </template>
    </ULandingSection>
  </div>
</template>
