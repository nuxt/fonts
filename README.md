[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

# Nuxt Fonts

Plug-and-play custom web font optimization and configuration for Nuxt apps.

- [👾 &nbsp;Playground](https://stackblitz.com/github/nuxt/fonts/tree/main/playground)

## 🚧 Roadmap

- [x] zero-configuration required
- [x] built-in providers
   - [x] `google`
   - [x] `local`
   - [ ] `fontshare`
   - [ ] `fontsource`
   - [ ] `bunny`
- [x] custom providers for full control
- [x] local download support (until `nuxt/assets` lands)
- [ ] automatic font metric optimisation powered by https://github.com/unjs/fontaine
- [ ] devtools integration
- [ ] (automatic?) font subsetting support
- [ ] documentation (module usage, custom provider creation)

👉 See [Nuxt Fonts RFC](https://github.com/nuxt/nuxt/discussions/22014) for full details and discussion.

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
[npm-version-href]: https://npmjs.com/package/@nuxt/fonts/v/rc

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/fonts/v/rc

[license-src]: https://img.shields.io/npm/l/@nuxt/fonts.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxt/fonts/v/rc

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt/fonts?utm_source=nuxt_image_readme
