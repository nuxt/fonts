<script lang="ts" setup>
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import type { FontFaceData } from 'unifont'

import type { ClientFunctions, ServerFunctions, ManualFontDetails, ProviderFontDetails } from '../src/devtools'
import { DEVTOOLS_RPC_NAMESPACE } from '../src/constants'

type AnnotatedFont = (ManualFontDetails | ProviderFontDetails) & {
  css?: string
}

const fonts = ref<AnnotatedFont[]>([])
const search = ref('')
const selected = ref<AnnotatedFont>()
const filtered = computed(() => fonts.value.filter(font => font.fontFamily.toLowerCase().includes(search.value.toLowerCase())))

interface DevtoolsRpcClient {
  call: (name: string, ...args: unknown[]) => Promise<unknown>
  client: { register: (fn: unknown, force?: boolean) => void }
}

interface Rpc {
  getFonts: () => Promise<Array<ManualFontDetails | ProviderFontDetails>> | Array<ManualFontDetails | ProviderFontDetails>
  generateFontFace: (fontFamily: string, font: FontFaceData) => Promise<string> | string
}

function connect(client: Parameters<Parameters<typeof onDevtoolsClientConnected>[0]>[0]): Rpc {
  const exposeFonts = (newFonts: Array<ManualFontDetails | ProviderFontDetails>) => {
    fonts.value = removeDuplicates(newFonts)
  }

  const kit = (client.devtools as { devtoolsKit?: DevtoolsRpcClient }).devtoolsKit

  if (kit) {
    kit.client.register({
      name: `${DEVTOOLS_RPC_NAMESPACE}:exposeFonts`,
      type: 'event',
      handler: exposeFonts,
    }, true)

    return {
      getFonts: () => kit.call(`${DEVTOOLS_RPC_NAMESPACE}:getFonts`) as Promise<Array<ManualFontDetails | ProviderFontDetails>>,
      generateFontFace: (fontFamily, font) => kit.call(`${DEVTOOLS_RPC_NAMESPACE}:generateFontFace`, fontFamily, font) as Promise<string>,
    }
  }

  return client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>(DEVTOOLS_RPC_NAMESPACE, { exposeFonts })
}

function syncColorMode(client: Parameters<Parameters<typeof onDevtoolsClientConnected>[0]>[0]) {
  const hostColorMode = client.host?.app?.colorMode
  watchEffect(() => {
    const mode = hostColorMode?.value ?? client.devtools?.colorMode
    if (mode) {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
  })
}

onMounted(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  document.documentElement.classList.toggle('dark', media.matches)
})

onDevtoolsClientConnected(async (client) => {
  syncColorMode(client)

  const rpc = connect(client)

  fonts.value = removeDuplicates(await rpc.getFonts())

  // TODO: fix this (only testing to see how it'll look like)
  for (const family of fonts.value) {
    let css = ''
    if (!('provider' in family) || family.provider !== 'local') {
      for (const font of family.fonts) {
        css += await rpc.generateFontFace(family.fontFamily, font) + '\n'
      }
    }
    family.css = css
    //  add css to document style
    window.document.head.appendChild(document.createElement('style')).textContent = css
  }
})

function removeDuplicates<T extends ManualFontDetails | ProviderFontDetails>(array: Array<T>): T[] {
  return array.filter((item, index) => index === array.findIndex(other => JSON.stringify(other) === JSON.stringify(item)))
}

function prettyURL(font: FontFaceData) {
  const firstRemoteSource = font.src.find(i => 'url' in i)
  if (firstRemoteSource) {
    return firstRemoteSource.originalURL || firstRemoteSource.url
  }
}
</script>

<template>
  <AppSplitPane
    storage-key="devtools:fonts"
    class="h-screen!"
    :min-size="30"
  >
    <template #left>
      <AppNavbar v-model:search="search">
        <!-- TODO: add support for editing fonts config -->
        <!-- <template #actions>
          <button
            title="Fonts Config"
            class="icon-button h-full text-orange"
          >
            <div class="i-carbon-settings" />
          </button>
        </template> -->
        <div class="text-xs">
          <span
            v-if="search"
            class="op-40"
          >
            {{ filtered.length }} matched ·
          </span>
          <span class="op-40">
            {{ fonts.length }} fonts in total
          </span>
        </div>
      </AppNavbar>
      <div
        :grid="`~ ${selected ? 'cols-3' : 'cols-5'}`"
        class="p-4 gap-4 text-center"
      >
        <AppCard
          v-for="family of filtered"
          :key="family.fontFamily"
          :title="family.fontFamily"
          class="truncate text-gray-500/75 p-4 cursor-pointer hover:bg-active"
          :class="{ 'bg-active!': selected === family }"
          @click="selected = family"
        >
          <h1
            text="base 5xl"
            class="mb-2"
            :style="{ fontFamily: family.fontFamily }"
          >
            Aa
          </h1>
          <small>
            {{ family.fontFamily }}
          </small>
        </AppCard>
      </div>
    </template>
    <template
      v-if="selected"
      #right
    >
      <AppNavbar>
        <template #actions>
          <div class="flex justify-between items-center w-full py-2">
            <div
              class="font-bold flex items-center gap-2"
              :style="{ fontFamily: selected.fontFamily }"
            >
              <AppBadge>
                <div class="i-carbon-text-font flex-none" />
              </AppBadge>
              {{ selected.fontFamily }}
            </div>
            <div class="flex items-center gap-2">
              <AppBadge
                v-if="'provider' in selected"
                class="flex items-center gap-2 px-3 py-1 bg-green/10 text-green"
                title="Provider"
              >
                <div class="i-carbon-load-balancer-global flex-none" />
                {{ selected.provider }}
              </AppBadge>
              <button
                class="icon-button text-red"
                title="Close"
                @click="selected = undefined"
              >
                <div class="i-carbon-close-large" />
              </button>
            </div>
          </div>
        </template>
      </AppNavbar>
      <div class="p-4 overflow-hidden">
        <AppSection
          text="Properties"
          icon="i-carbon-information"
          container-class="font-mono text-xs"
        >
          <div class="flex items-center gap-2">
            <div class="op-60">
              type:
            </div>
            <div>
              {{ selected.type }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="op-60">
              provider:
            </div>
            <div v-if="'provider' in selected">
              {{ selected.provider }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="op-60">
              font family:
            </div>
            <div>
              {{ selected.fontFamily }}
            </div>
          </div>
        </AppSection>
        <AppSection
          text="Fonts"
          icon="i-carbon-text-align-left"
          container-class="font-mono text-xs flex flex-col gap-y-2"
        >
          <div
            v-for="font, index of selected.fonts"
            :key="`${selected.fontFamily}-${index}`"
            class="flex justify-between items-center gap-2 mt-2"
          >
            <div class="flex flex-col gap-1 min-w-0">
              <span class="line-clamp-1">
                {{ prettyURL(font) }}
              </span>
              <span class="flex flex-row gap-1 opacity-75">
                <div class="shrink-0">
                  {{ font.style || 'normal' }}
                  {{ Array.isArray(font.weight) ? font.weight.join('-') : font.weight }}
                </div>
                <span
                  v-if="font.unicodeRange"
                  class="flex gap-1"
                >
                  <span class="opacity-75">
                    |
                  </span>
                  <span
                    class="line-clamp-1"
                  >
                    {{ font.unicodeRange?.join(', ') }}
                  </span>
                </span>
              </span>
              <span class="flex flex-row">
                <Suspense>
                  <FontFileSize :font="font" />
                </Suspense>
              </span>
            </div>
            <a
              class="icon-button text-blue"
              title="Download"
              download
              target="_blank"
              :href="font.src.find((i) => 'url' in i)?.url"
            >
              <div class="i-carbon-download" />
            </a>
          </div>
        </AppSection>
        <AppSection
          text="Generated CSS"
          icon="i-carbon-paint-brush"
        >
          <AppCodeBlock
            v-if="selected.css"
            :code="selected.css"
            lang="css"
            class="overflow-x-scroll border border-base rounded-lg text-xs py-2"
          />
        </AppSection>
      </div>
    </template>
  </AppSplitPane>
</template>

<style>
pre:has(code) {
  padding: 10px;
  border-radius: 10px;
}

details {
  border: 0;
  border-right: 1px solid rgb(156 163 175 / 0.2)!important;
  border-left: 1px solid rgb(156 163 175 / 0.2)!important;
}

details:first-of-type {
  border-top: 1px solid rgb(156 163 175 / 0.2);
}

details:not(:first-of-type):not(:last-of-type) {
  border: 1px solid rgb(156 163 175 / 0.2);
  border-left: 1px solid rgb(156 163 175 / 0.2);
}

details:last-of-type {
  border-bottom: 1px solid rgb(156 163 175 / 0.2);
}

details[open] summary {
  border-bottom: 1px solid rgb(156 163 175 / 0.2)!important;
}
</style>
