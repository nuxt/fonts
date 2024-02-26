<script lang="ts" setup>
import { ref } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import {} from '@nuxt/devtools-kit/iframe-client'

import type { ClientFunctions, ServerFunctions } from '../src/devtools'
import { DEVTOOLS_RPC_NAMESPACE } from '../src/constants'

const fonts = ref([])

onDevtoolsClientConnected(async (client) => {
  const rpc = client.devtools.extendClientRpc<ServerFunctions, ClientFunctions>(DEVTOOLS_RPC_NAMESPACE, {
    exposeFonts (newFonts) {
      fonts.value.push(...newFonts)
    },
  })

  // call server RPC functions
  fonts.value = await rpc.getFonts()
})
</script>

<template>
  <div>
    Nuxt Fonts:
    <pre>{{ fonts }}</pre>
  </div>
</template>
