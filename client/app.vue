<script lang="ts" setup>
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'

import type { ClientFunctions, ServerFunctions, ManualFontDetails, ProviderFontDetails } from '../src/devtools'
import { DEVTOOLS_RPC_NAMESPACE } from '../src/constants'
import type { FontFaceData } from '../src/types'

type AnnotatedFont = (ManualFontDetails | ProviderFontDetails) & {
  css?: string
}

const fonts = ref<AnnotatedFont[]>([])
const search = ref('')
const selected = ref<AnnotatedFont>()
const filtered = computed(() => fonts.value.filter(font => font.fontFamily.toLowerCase().includes(search.value.toLowerCase())))

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>(DEVTOOLS_RPC_NAMESPACE, {
    exposeFonts(newFonts) {
      fonts.value.push(...newFonts)
    },
  })

  // call server RPC functions
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
  <NSplitPane
    storage-key="devtools:fonts"
    class="!h-screen"
    :min-size="30"
  >
    <template #left>
      <NNavbar v-model:search="search">
        <!-- TODO: add support for editing fonts config -->
        <!-- <template #actions>
          <NButton
            title="Fonts Config"
            class="h-full"
            n="orange xl"
            icon="i-carbon-settings"
          />
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
      </NNavbar>
      <div
        :grid="`~ ${selected ? 'cols-3' : 'cols-5'}`"
        class="p-4 gap-4 text-center"
      >
        <NCard
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
        </NCard>
      </div>
    </template>
    <template
      v-if="selected"
      #right
    >
      <NNavbar>
        <template #actions>
          <div class="flex justify-between items-center w-full py-2">
            <div
              class="font-bold flex items-center gap-2"
              :style="{ fontFamily: selected.fontFamily }"
            >
              <NBadge>
                <NIcon icon="i-carbon-text-font" />
              </NBadge>
              {{ selected.fontFamily }}
            </div>
            <div class="flex items-center gap-2">
              <NBadge
                v-if="'provider' in selected"
                class="flex items-center gap-2 px-3 py-1"
                title="Provider"
                n="green"
              >
                <NIcon icon="i-carbon-load-balancer-global" />
                {{ selected.provider }}
              </NBadge>
              <NButton
                n="red"
                icon="i-carbon-close-large"
                @click="selected = undefined"
              />
            </div>
          </div>
        </template>
      </NNavbar>
      <div class="p-4 overflow-hidden">
        <NSectionBlock
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
        </NSectionBlock>
        <NSectionBlock
          text="Fonts"
          icon="i-carbon-text-align-left"
          container-class="font-mono text-xs"
        >
          <div
            v-for="font, index of selected.fonts"
            :key="index"
            class="flex justify-between items-center gap-2"
          >
            <div class="flex flex-col gap-1">
              <span class="line-clamp-1">
                {{ prettyURL(font) }}
              </span>
              <span class="flex flex-row gap-1 opacity-75">
                {{ font.style || 'normal' }}
                <span class="flex flex-row gap-1">
                  {{ Array.isArray(font.weight) ? font.weight.join('-') : font.weight }}
                </span>
              </span>
              <span
                v-if="font.unicodeRange"
                class="line-clamp-1 opacity-75"
              >
                <NIcon icon="i-carbon:language" />
                {{ font.unicodeRange?.join(', ') }}
              </span>
            </div>
            <NButton
              n="sm blue"
              icon="i-carbon-download"
              download
              target="_blank"
              external
              :to="font.src.find((i) => 'url' in i)?.url"
            />
          </div>
        </NSectionBlock>
        <NSectionBlock
          text="Generated CSS"
          icon="i-carbon-paint-brush"
        >
          <NCodeBlock
            v-if="selected.css"
            :code="selected.css"
            lang="css"
            class="overflow-x-scroll border border-base rounded-lg"
          />
        </NSectionBlock>
      </div>
    </template>
  </NSplitPane>
</template>

<style>
.shiki-themes.vitesse-dark {
  background-color: #121212!important;
  padding-top: 10px;
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
