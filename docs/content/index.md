---
seo:
  title: Optimized Custom Web Fonts for your Nuxt Apps
  description: Plug-and-play custom web font optimization and configuration for Nuxt apps. Use and optimize your fonts using your favorite font source.
---

::hero-background{class="absolute w-full top-[var(--ui-header-height)] transition-all text-primary flex-shrink-0"}
::

::u-page-hero
---
orientation: horizontal
ui:
  container: py-14 sm:py-16 lg:pt-16 lg:pb-24 gap-10 lg:gap-16
---
#title
Web fonts for Nuxt, [without the setup]{class="text-primary-600 dark:text-primary-400"}

#description
Write a `font-family` declaration and Nuxt Fonts finds the font, serves it from your own origin, and generates fallback metrics to reduce layout shift.

#links
  :::u-button
  ---
  size: xl
  to: /get-started/installation
  icon: i-lucide-rocket
  ---
  Get started
  :::

  :::copy-code-input{source="npx nuxt module add fonts"}
  :::

#default
:::fonts-videos
:::
::

::u-page-section
#title
One declaration. [Any provider.]{class="text-primary-600 dark:text-primary-400"}

#description
Providers connect Nuxt Fonts to a font source. Each one knows how to look up a family, fetch its files and report its metrics. Pick a built-in provider, mix several in one project, or write your own.

#body
  :::font-specimens
  :::

  :::provider-index
  ---
  class: mt-10
  ---
  :::

#links
  :::u-button
  ---
  size: lg
  color: neutral
  variant: subtle
  to: /get-started/providers
  trailing-icon: i-lucide-arrow-right
  ---
  Read the provider docs
  :::
::

::u-page-section
#title
What happens [after the build starts]{class="text-primary-600 dark:text-primary-400"}

#description
Nuxt Fonts runs over your CSS as it's processed, so there's nothing to import and no component to wrap your text in.

#body
  :::font-pipeline
  :::

#links
  :::u-button
  ---
  size: lg
  color: neutral
  variant: subtle
  to: /advanced#how-it-works
  trailing-icon: i-lucide-arrow-right
  ---
  How it works in detail
  :::
::

::u-page-section
---
ui:
  features: sm:grid-cols-2 lg:grid-cols-2 gap-x-10 gap-y-8
---
#title
Defaults worth [keeping]{class="text-primary-600 dark:text-primary-400"}

#features
  :::u-page-feature
  ---
  to: /get-started/configuration
  class: border-t border-default pt-6
  ---
  #title
  No configuration to start

  #description
  Add the module and keep writing CSS. Everything here is a default you can change, not a step you have to take.
  :::

  :::u-page-feature
  ---
  to: /get-started/providers
  class: border-t border-default pt-6
  ---
  #title
  Eight built-in providers

  #description
  `local`, `google`, `googleicons`, `bunny`, `fontshare`, `fontsource`, `npm` and `adobe`, plus any provider you write.
  :::

  :::u-page-feature
  ---
  to: /advanced#how-it-works
  class: border-t border-default pt-6
  ---
  #title
  Self-hosted in production

  #description
  Fonts are downloaded at build time and served from your own origin with long-lived cache headers.
  :::

  :::u-page-feature
  ---
  to: /get-started/configuration#glyphs
  class: border-t border-default pt-6
  ---
  #title
  Smaller files when you ask

  #description
  Opt in to the `glyphs` option to subset a family down to the characters you actually render.
  :::
::

::u-page-section
---
ui:
  features: sm:grid-cols-3 gap-6
---
#title
Built on [unjs]{class="text-primary-600 dark:text-primary-400"}

#description
Nuxt Fonts is the Nuxt-shaped layer over a handful of unjs packages. Each of them is useful on its own.

#features
  :::u-page-card
  ---
  variant: subtle
  to: https://unifont.dev
  target: _blank
  ---
  #title
  unifont

  #description
  Resolves font metadata from Google, Adobe, Bunny, Fontshare, Fontsource, npm and any provider you write. Framework-agnostic.
  :::

  :::u-page-card
  ---
  variant: subtle
  to: https://github.com/unjs/fontaine
  target: _blank
  ---
  #title
  fontaine

  #description
  Generates the adjusted fallback `@font-face` rules that keep your layout still while a web font loads.
  :::

  :::u-page-card
  ---
  variant: subtle
  to: https://github.com/unjs/fontaine
  target: _blank
  ---
  #title
  fontless

  #description
  The same pipeline as a Vite plugin, for projects that aren't built on Nuxt.
  :::
::

::u-page-section
---
class: bg-muted border-t border-default
---
#title
Add it to your app [in one command]{class="text-primary-600 dark:text-primary-400"}

#description
Nuxt Fonts is MIT licensed and maintained by the Nuxt team.

#links
  :::u-button
  ---
  size: xl
  to: /get-started/installation
  icon: i-lucide-rocket
  ---
  Get started
  :::

  :::u-button
  ---
  size: xl
  color: neutral
  variant: subtle
  to: https://github.com/nuxt/fonts
  target: _blank
  icon: i-simple-icons-github
  ---
  Star on GitHub
  :::
::
