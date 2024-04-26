![nuxt-fonts](https://github.com/nuxt/fonts/assets/904724/75121716-05fd-459b-9223-42eb9dc8646f)

# Nuxt Fonts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

Plug-and-play custom web font optimization and configuration for Nuxt apps.

- [👾 &nbsp;Playground](https://stackblitz.com/github/nuxt/fonts/tree/main/playground)

## Features

- ✨ zero-configuration required
- 🔡 built-in providers (`google`, `bunny`, `fontshare`, `fontsource`, `adobe`, `local` - more welcome!)
- 💪 custom providers for full control
- ⏬ local download support (until `nuxt/assets` lands)
- ⚡️ automatic font metric optimisation powered by [**fontaine**](https://github.com/unjs/fontaine) and [**capsize**](https://github.com/seek-oss/capsize)
- 🔥 build/dev time font caching powered by [**unstorage**](https://github.com/unjs/unstorage)

👉 See [Nuxt Fonts RFC](https://github.com/nuxt/nuxt/discussions/22014) for full details and discussion.

## Quick Start

To get started, simply run:

```sh
npx nuxi@latest module add @nuxt/fonts
```

If you don't already have it in your `.gitignore`, go ahead and add the `.data` directory:

```ignore
.data
```

Then just add a `font-family` declaration in your CSS:

```vue
<template>
  <div>
    Hello Nuxt Fonts!
  </div>
</template>

<style scoped>
div {
  font-family: Roboto, sans-serif;
}
</style>
```

That's it! Nuxt Fonts will detect this and you should immediately see the web font loaded in your browser. [Read more about how it works](#how-it-works).

> [!TIP]
> Even if you're using a preprocessor like TailwindCSS or UnoCSS, Nuxt Fonts should be able to detect and optimize your fonts with no configuration. (**Note** that if you are using UnoCSS, you should disable the web fonts preset as it is an alternative to Nuxt Fonts.)

## Configuration

You do not need to configure Nuxt Fonts but you can do so for finer-grained control.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  fonts: {
    // You can provide overrides for individual families
    families: [
      // do not resolve this font with any provider from `@nuxt/fonts`
      { name: 'Custom Font', provider: 'none' },
      // only resolve this font with the `google` provider
      { name: 'My Font Family', provider: 'google' },
      // specify specific font data - this will bypass any providers
      { name: 'Other Font', src: 'url(https://example.com/font.woff2)', weight: 'bold' },
    ],
    // The weights, styles, and subsets to generate font face rules for.
    // You can also customize these for a specific family, within `families`.
    defaults: {
      // This is true by default for the highest priority format unless a font is subsetted.
      // By setting this to true it will force the highest priority format of _all_ fonts to be preloaded.
      // preload: true,
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: [
        'cyrillic-ext',
        'cyrillic',
        'greek-ext',
        'greek',
        'vietnamese',
        'latin-ext',
        'latin',
      ]
    },
    // If you use a generic font family like `Roboto, sans-serif`, we will 'translate' that
    // generic family name into one or more font families when generating fallback metrics.
    // You can customize which families we use. (One or two works best.)
    fallbacks: {
      'serif': ['Times New Roman'],
      'sans-serif': ['Arial'],
      'monospace': ['Courier New'],
      // ...
    },
    assets: {
      // The prefix where your fonts will be accessible
      prefix: '/_fonts'
    },
    providers: {
      // you can pass a new custom provider - see 'Writing a custom provider' below
      // for what this file should look like
      custom: '~/providers/custom',
      // Or you can disable a built-in provider
      google: false,
    },
    // You can customize the order in which providers are checked.
    priority: ['bunny', 'google'],
    // You can also set a single provider, which is a shortcut for disabling all but one provider
    provider: 'fontshare',
    experimental: {
      // You can also enable support for processing CSS variables for font family names.
      // This may have a performance impact.
      processCSSVariables: true,
    }
  }
})
```

## How it works

Nuxt Fonts processes all your CSS and does the following things automatically when it encounters a `font-family` declaration.

1. **Resolves fonts used in CSS**. It starts by looking in your `public/` directory for font files that match the name, like `Roboto.woff2`, `RobotoBold.ttf`, etc. Then it moves on to web font providers like `google`, `bunny` and `fontshare`. Once a provider is found (in this case, probably [Google Fonts](https://fonts.google.com)), we move on to the next step.
1. **Generates and injects `@font-face` rules for you.** We'll generate rules to point your browser to the right source files. They'll be injected into the same CSS where you use the `font-family`.
   ```css
   /* If you write something like this: */
   :root {
     font-family: Poppins;
   }
   ```

   ```css
   /* Then Nuxt fonts will add declarations that look like this at the beginning of the CSS file: */
   @font-face {
     font-family: 'Poppins';
     src: local("Poppins"), url("/_fonts/<hash>.woff2") format(woff2);
     font-display: swap;
     unicode-range: U+0000-00FF,U+0131, /* ... */;
     font-weight: 400;
     font-style: normal;
   }
   /* ... plus more font-face declarations for other unicode ranges/weights */
   ```
1. **Proxies and caches font requests.** Rather than using the original source URLs (to remote servers), we generate rewrites under the `/_fonts` subpath. When accessed by your browser, we download the font from the remote server and cache it locally.
1. **Creates font fallback metrics.** If we have access to the font metrics (ascent, descent, line gap, character width, etc.) then we can generate a fallback `@font-face` declaration as well. The idea is that we 'morph' a local system font (like Arial or Times New Roman) to be as close as possible to the size of the web font, to decrease layout shift ([read more about CLS](https://web.dev/articles/cls)).
   ```css
   :root {
     /* This will generate fallbacks for local versions of Helvetica and Arial, adjusted to match Roboto's metrics. */
     font-family: Roboto, Helvetica, Arial;
     /* If you provide a generic family (like serif or sans-serif), we will use a system font from that family. */
     font-family: Merriweather, serif;
   }
   ```
1. **Include fonts in build.** When you build your project, we'll copy across all the fonts used in your project so you don't need to make any external requests when loading your site. (Any that haven't already been cached in development are downloaded at build time.) Font file names are hashed and Nuxt will serve them with long-lived cache headers.

## Font providers

Font providers are designed to be pluggable and extensible, so no matter your setup you should be able to use an existing provider or write your own, and still benefit from core functionality of Nuxt Fonts.

We ship with the following built-in providers.

### `local`

The local provider deeply scans your `public/` directories (including of your layers) for font files (supporting ttf, woff, woff2, eot or otf extensions).

Then, when you use a `font-family` in your CSS, we check to see whether it matches one of these files. We also expect font weight, font style and subset to be in the file name, unless they are 'default' values (`400` weight, `normal` style and `latin` subset).

### `google`

[Google Fonts](https://fonts.google.com/) is one of the best known public font APIs.

### `bunny`

[Bunny Fonts](https://fonts.bunny.net/) is provided by [bunny.net](https://bunny.net/) and is a drop-in Google Fonts compatible API, focusing on privacy.

### `fontshare`

[Fontshare](https://www.fontshare.com/) is a free font service with 100+ professional-grade fonts from the Indian Type Foundry (ITF).

You should read [their terms in full](https://www.fontshare.com/licenses/itf-ffl) before using a font through `fontshare`.

### `fontsource`

[Fontsource](https://fontsource.org/docs/getting-started/introduction) is a collection of open-source fonts that are designed for self-hosting in web applications.

### `adobe`

[Adobe Fonts](https://fonts.adobe.com/) is a font service for both personal and commercial use included with Creative Cloud subscriptions.

To configure the Adobe provider in your Nuxt app, you must provide a Project ID or array of Project IDs corresponding to the Web Projects you have created in Adobe Fonts.

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  fonts: {
    adobe: {
      id: ['<some-id>', '<another-kit-id>'],
    },
  }
})
```

> [!WARNING]
> We currently can't provide non-latin subsets for Adobe Fonts as they do not have a public API for that. Please use other providers in such cases.

> [!WARNING]
> You should read [their terms in full](https://www.adobe.com/legal/terms.html) before using a font through `adobe`.

### Writing a custom provider

The provider API is likely to evolve in the next few releases of Nuxt Fonts, but at the moment it looks like this:

```ts
import { defineFontProvider } from '@nuxt/fonts/utils'

export default defineFontProvider({
  async setup () {
    // do some setup
  },
  async resolveFontFaces (fontFamily, defaults) {
    if (fontFamily === 'My Font Family') {
      return {
        fonts: [
          {
            src: [
              { url: 'https://cdn.org/my-font.woff2', format: 'woff2' },
              'https://cdn.org/my-font.woff', // this will be inferred as a `woff` format file
            ],
            weight: 400,
            style: 'normal',
          }
        ]
      }
    }
  }
})
```

Module authors can also add their own providers (or remove existing ones) in the `fonts:providers` hook which is called by Nuxt Fonts after all modules have run.

```ts
nuxt.hook('fonts:providers', providers => {
  providers.push({
    async setup () {
      /** some setup */
    },
    async resolveFontFaces (fontFamily, defaults) {
      /** resolve font faces */
    }
  })
})
```

### Contributing

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## 📑 License

Published under the [MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxt/fonts/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt/fonts/v/latest

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/fonts/v/latest

[license-src]: https://img.shields.io/npm/l/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxt/fonts/v/latest

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt/fonts?utm_source=nuxt_fonts_readme
