![nuxt-fonts](https://github.com/nuxt/fonts/assets/904724/75121716-05fd-459b-9223-42eb9dc8646f)

# Nuxt Fonts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

Plug-and-play custom web font optimization and configuration for Nuxt apps.

- [📖 &nbsp;Read Documentation](https://fonts.nuxt.com)
- [👾 &nbsp;Playground](https://stackblitz.com/github/nuxt/fonts/tree/main/playgrounds/basic)

## Features

- ✨ zero-configuration required
- 🔡 built-in providers (`google`, `bunny`, `fontshare`, `fontsource`, `adobe`, `local` - more welcome!)
- 💪 custom providers for full control
- ⏬ local download support (until `nuxt/assets` lands)
- ⚡️ automatic font metric optimisation powered by [**fontaine**](https://github.com/unjs/fontaine) and [**capsize**](https://github.com/seek-oss/capsize)
- 🔥 build/dev time font caching powered by [**unstorage**](https://github.com/unjs/unstorage)

👉 See [Nuxt Fonts RFC](https://github.com/nuxt/nuxt/discussions/22014) for full details and discussion.

### Contributing

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [the basic playground](./playgrounds/basic) in development mode.

## 📑 License

Published under the [MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxt/fonts/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npm.chart.dev/@nuxt/fonts

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npm.chart.dev/@nuxt/fonts/v/latest

[license-src]: https://img.shields.io/npm/l/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxt/fonts/v/latest

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt/fonts?utm_source=nuxt_fonts_readme
