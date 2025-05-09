<script lang="ts" setup>
import type { FontFaceData } from 'unifont'

const props = defineProps<{
  font: FontFaceData
}>()

// TODO: Should just use HEAD. But seems like Vite devserver is not handling HEADs properly. Needs investigation.
const { headers, status } = await $fetch.raw(props.font.src.find(i => 'url' in i)!.url, { method: 'GET', baseURL: '/', ignoreResponseError: true })

const fileSize = Number(headers.get('content-length')!)

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1000))
  const formattedSize = (bytes / Math.pow(1000, i)).toFixed(2)

  return `${formattedSize}${sizes[i]}`
}

const badgeColor = status !== 200 ? 'bg-red-600 text-white' : fileSize < 30000 ? '' : fileSize < 100000 ? 'text-yellow' : 'text-red'
</script>

<template>
  <NBadge
    class="flex space-x-1 text-[0.6rem] rounded-full"
    :class="[badgeColor]"
  >
    <div
      v-if="status !== 200"
    >
      {{ status }}
    </div>
    <div v-else>
      {{ formatBytes(fileSize) }}
    </div>
  </NBadge>
</template>
