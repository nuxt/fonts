---
title: Nuxt Fonts
description: 'Plug-and-play web font optimization and configuration for Nuxt apps.'
navigation:
  title: Quick Start
---

## Introduction

Write a `font-family` declaration and Nuxt Fonts finds the font, serves it from your own origin, and generates fallback metrics to reduce layout shift. There's nothing to import and no component to wrap your text in.

::video{src="./images/demo.mp4" poster="./images/demo-poster.jpg" controls preload="none" width="1440" height="1080"}
::

- **No configuration to start**: add the module and keep writing CSS. Every option is a default you can change, not a step you have to take.
- **Eight built-in providers**: `local`, `google`, `googleicons`, `bunny`, `fontshare`, `fontsource`, `npm` and `adobe`, plus any [provider](/modules/fonts/providers) you write.
- **Self-hosted in production**: fonts are downloaded at build time and served from your own origin with long-lived cache headers.
- **Less layout shift**: a local system font is scaled to match each web font's metrics, so text barely moves when the real file arrives.
- **Smaller files when you ask**: the [`glyphs`](/modules/fonts/configuration#glyphs) option subsets a family down to the characters you actually render.

## Automatic Installation

To get started, add `@nuxt/fonts` to your project:

```bash
npx nuxt module add fonts
```

## Manual Installation

Or you can install it manually.

::code-group
  ```bash [pnpm]
  pnpm i @nuxt/fonts
  ```
  ```bash [yarn]
  yarn add @nuxt/fonts
  ```
  ```bash [npm]
  npm i @nuxt/fonts
  ```
::

Then, add it to the `modules` in your `nuxt.config`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
    '@nuxt/fonts',
  ]
})
```

## Usage

You can now get started by adding a `font-family` declaration to your CSS.

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

That's it! Nuxt Fonts will detect this and you should immediately see the web font loaded in your browser. [Read more about how it works](/modules/fonts/advanced#how-it-works).

::note{to="/modules/fonts/configuration"}
To keep downloads small, `@nuxt/fonts` loads the `400 700` weight range by default rather than every weight a family ships. The *configuration docs* cover how to change that, along with every other option.
::

## Troubleshooting

If an error occurs during installation:

- Ensure that you are using the latest LTS version of Node.js ([release schedule](https://github.com/nodejs/release#release-schedule))

- Try to upgrade to latest versions:

  ::code-group
    ```bash [pnpm]
    pnpm up @nuxt/fonts
    ```

    ```bash [yarn]
    yarn upgrade @nuxt/fonts
    ```

    ```bash [npm]
    npm up @nuxt/fonts
    ```
  ::

- Try recreating your lock-file:

  ```bash
  npx nuxt upgrade --force
  ```

- Check your network connection. Your machine might be having a hard time communicating with the font providers.

- If none of the above worked, please [open an issue](https://github.com/nuxt/fonts/issues) and include the error trace, OS, Node version and the package manager used for installing.

- If you're missing certain fonts or their variations, please confirm the module is [configured to load](/modules/fonts/configuration#styles) the fonts you expected to see.
