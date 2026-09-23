<template>
  <ol class="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
    <li class="flex min-w-0 flex-col gap-2 border-t-2 border-primary/30 pt-4">
      <span class="font-mono text-xs tabular-nums text-primary">01</span>
      <h3 class="text-base font-semibold text-highlighted">
        Resolve
      </h3>
      <p class="text-sm text-muted">
        Nuxt Fonts reads every <code class="font-mono text-xs">font-family</code> in your CSS, checks
        <code class="font-mono text-xs">public/</code> for a matching file, then asks each provider in turn.
      </p>
      <p class="mt-auto pt-1 text-sm text-dimmed">
        Provider lookups run through
        <ULink
          to="https://unifont.dev"
          target="_blank"
          class="text-toned underline decoration-primary/40 underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >unifont</ULink>.
      </p>
    </li>

    <li class="flex min-w-0 flex-col gap-2 border-t-2 border-primary/30 pt-4">
      <span class="font-mono text-xs tabular-nums text-primary">02</span>
      <h3 class="text-base font-semibold text-highlighted">
        Generate
      </h3>
      <p class="text-sm text-muted">
        Matching families get <code class="font-mono text-xs">@font-face</code> rules injected into the same
        stylesheet that used them, with the right weights, styles and unicode ranges.
      </p>
    </li>

    <li class="flex min-w-0 flex-col gap-2 border-t-2 border-primary/30 pt-4">
      <span class="font-mono text-xs tabular-nums text-primary">03</span>
      <h3 class="text-base font-semibold text-highlighted">
        Serve
      </h3>
      <p class="text-sm text-muted">
        Font files are downloaded at build time, hashed into your build assets and served from your own
        origin, so production makes no third-party requests.
      </p>
    </li>

    <li class="flex min-w-0 flex-col gap-2 border-t-2 border-primary/30 pt-4">
      <span class="font-mono text-xs tabular-nums text-primary">04</span>
      <h3 class="text-base font-semibold text-highlighted">
        Stabilise
      </h3>
      <p class="text-sm text-muted">
        A local system font is scaled to match the web font's metrics, so text barely moves when the real
        file arrives.
      </p>
      <p class="mt-auto pt-1 text-sm text-dimmed">
        Fallback metrics come from
        <ULink
          to="https://github.com/unjs/fontaine"
          target="_blank"
          class="text-toned underline decoration-primary/40 underline-offset-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >fontaine</ULink>.
      </p>
    </li>
  </ol>
</template>
