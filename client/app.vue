<script lang="ts" setup>
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'

import type { ClientFunctions, ServerFunctions, ManualFontDetails, ProviderFontDetails } from '../src/devtools'
import { DEVTOOLS_RPC_NAMESPACE } from '../src/constants'
import type { NormalizedFontFaceData } from '../src/types'

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

function prettyURL(font: NormalizedFontFaceData) {
  const firstRemoteSource = font.src.find(i => 'url' in i)
  if (firstRemoteSource) {
    return firstRemoteSource.originalURL || firstRemoteSource.url
  }
}
</script>

<template>
  <main
    :grid="`~ ${selected ? 'cols-2' : 'cols-1'}`"
    class="h-screen of-hidden"
  >
    <div class="of-auto">
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
    </div>
    <div
      v-if="selected"
      class="border-l border-base of-auto"
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
        <section class="border-b border-base mb-4 pb-4">
          <span class="op-40">
            Properties:
          </span>
          <div v-if="selected.type">
            type: {{ selected.type }}
          </div>
          <div v-if="'provider' in selected">
            provider: {{ selected.provider }}
          </div>
        </section>
        <section class="border-b border-base mb-4 pb-4 flex flex-col gap-4">
          <span class="op-40">
            Fonts:
          </span>
          <div
            v-for="font, index of selected.fonts"
            :key="index"
            class="flex justify-between items-center gap-2"
          >
            <div class="font-mono text-xs flex flex-col gap-1">
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
        </section>
        <section class="mb-4 pb-4 flex flex-col gap-4 overflow-x-scroll">
          <span class="op-40">
            Generated CSS:
          </span>
          <NCodeBlock
            v-if="selected.css"
            :code="selected.css"
          />
          <!-- dev only, will remove it later -->
          <!-- <NCodeBlock
            :code="JSON.stringify(selected, null, 2)"
          /> -->
        </section>
      </div>
    </div>
  </main>
</template>
