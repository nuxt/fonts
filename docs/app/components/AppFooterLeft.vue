<script setup lang="ts">
const stack = [
  { label: 'unifont', to: 'https://unifont.dev' },
  { label: 'fontaine', to: 'https://github.com/unjs/fontaine' },
]
</script>

<template>
  <div class="flex flex-col gap-1 text-sm text-muted sm:flex-row sm:items-center sm:gap-3">
    <span>Copyright ©
      <NuxtTime
        :datetime="Date.now()"
        year="numeric"
      />
    </span>
    <span
      class="hidden text-dimmed sm:inline"
      aria-hidden="true"
    >·</span>
    <span>
      Built on
      <template
        v-for="(item, index) in stack"
        :key="item.label"
      >
        <ULink
          :to="item.to"
          target="_blank"
          class="whitespace-nowrap text-toned hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >{{ item.label }}</ULink><template v-if="index < stack.length - 1"> and </template>
      </template>
    </span>
  </div>
</template>
