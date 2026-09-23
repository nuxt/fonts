<script setup lang="ts">
const specimens = [
  { family: 'Fraunces', provider: 'google', class: 'font-fraunces', to: '/get-started/providers#google' },
  { family: 'Bricolage Grotesque', provider: 'bunny', class: 'font-bricolage', to: '/get-started/providers#bunny' },
  { family: 'Satoshi', provider: 'fontshare', class: 'font-satoshi', to: '/get-started/providers#fontshare' },
]
</script>

<template>
  <div class="grid overflow-hidden rounded-lg ring ring-default sm:grid-cols-3">
    <ULink
      v-for="specimen in specimens"
      :key="specimen.family"
      :to="specimen.to"
      class="group flex min-w-0 flex-col justify-between gap-6 border-t border-default bg-default p-5 transition-colors first:border-t-0 hover:bg-elevated/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:border-t-0 sm:border-l sm:p-6 sm:first:border-l-0"
    >
      <p
        :class="specimen.class"
        class="min-h-[2em] text-4xl/none text-highlighted [overflow-wrap:anywhere] sm:text-3xl/none lg:text-4xl/none"
      >
        {{ specimen.family }}
      </p>
      <div class="flex min-w-0 flex-col gap-1.5">
        <code class="truncate font-mono text-xs text-toned">font-family: '{{ specimen.family }}'</code>
        <span class="text-xs text-muted">
          resolved by the <span class="font-medium text-highlighted group-hover:text-primary">{{ specimen.provider }}</span> provider
        </span>
      </div>
    </ULink>
  </div>
</template>
