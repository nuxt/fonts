# Changelog


## v0.0.2

[compare changes](https://github.com/nuxt/fonts/compare/v0.0.1...v0.0.2)

### 🚀 Enhancements

- Minify injected css when building ([e906ada](https://github.com/nuxt/fonts/commit/e906ada))
- **deps:** Update `fontaine` to use new capsize metrics ([1800995](https://github.com/nuxt/fonts/commit/1800995))

### 🔥 Performance

- Store font data in `node_modules/.cache` ([ed3e9e5](https://github.com/nuxt/fonts/commit/ed3e9e5))
- Update to use `.cache/nuxt/fonts` prefix for all caches ([7b91b0d](https://github.com/nuxt/fonts/commit/7b91b0d))

### 🩹 Fixes

- **google:** Sort resolved variants when fetching font css ([#33](https://github.com/nuxt/fonts/pull/33))
- Don't add font storage to runtime 🙈 ([c06dd6d](https://github.com/nuxt/fonts/commit/c06dd6d))

### 📖 Documentation

- Remove nightly instructions ([760558b](https://github.com/nuxt/fonts/commit/760558b))

### 🏡 Chore

- Remove links to nuxt/image ([cb30d06](https://github.com/nuxt/fonts/commit/cb30d06))
- Add missing dev deps ([d03ffed](https://github.com/nuxt/fonts/commit/d03ffed))
- Skip type checking `scripts/` ([b5e7231](https://github.com/nuxt/fonts/commit/b5e7231))

### 🤖 CI

- Enable nightly release with provenance ([fcc1e87](https://github.com/nuxt/fonts/commit/fcc1e87))
- Remove `contents: read` permission as repo is now public ([ed4a2a9](https://github.com/nuxt/fonts/commit/ed4a2a9))
- Add changelogensets ([792de60](https://github.com/nuxt/fonts/commit/792de60))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Qwerzl ([@qwerzl](http://github.com/qwerzl))

## v0.0.1


### 🚀 Enhancements

- Add `local` and `google` providers ([ade031f](https://github.com/nuxt/fonts/commit/ade031f))
- **local:** Support looking up pascal-case fonts ([ad3ee31](https://github.com/nuxt/fonts/commit/ad3ee31))
- Support configure injecting fonts globally ([26fa0b3](https://github.com/nuxt/fonts/commit/26fa0b3))
- Support passing options to font providers ([306d2df](https://github.com/nuxt/fonts/commit/306d2df))
- Add `extractFontFaceData` utility ([0409ed1](https://github.com/nuxt/fonts/commit/0409ed1))
- Download (prod) or proxy (dev) provider font urls ([3774f06](https://github.com/nuxt/fonts/commit/3774f06))
- Add `bunny` provider ([3773a9d](https://github.com/nuxt/fonts/commit/3773a9d))
- Add automatic font metric optimisation ([ac0888b](https://github.com/nuxt/fonts/commit/ac0888b))
- Add `fontshare` provider ([#4](https://github.com/nuxt/fonts/pull/4))
- Expose `defineFontProvider` helper from `./utils` subpath ([cf31dbb](https://github.com/nuxt/fonts/commit/cf31dbb))

### 🔥 Performance

- Cache google/bunny font metadata ([ca2ddb1](https://github.com/nuxt/fonts/commit/ca2ddb1))
- Cache proxied fonts between requests ([89caf13](https://github.com/nuxt/fonts/commit/89caf13))

### 🩹 Fixes

- Improve handling of overrides for font families ([36123e1](https://github.com/nuxt/fonts/commit/36123e1))
- **transform:** Skip injecting declarations based on `@font-face` ([0cb114b](https://github.com/nuxt/fonts/commit/0cb114b))
- **transform:** Skip adding existing `@font-face` declarations ([79f9c58](https://github.com/nuxt/fonts/commit/79f9c58))
- Use `jiti` to load custom font providers ([a840e4d](https://github.com/nuxt/fonts/commit/a840e4d))
- Log when we are downloading fonts ([b1049ee](https://github.com/nuxt/fonts/commit/b1049ee))
- **transform:** Only add `@font-face` for first font in list ([0493d36](https://github.com/nuxt/fonts/commit/0493d36))
- Prepend local font sources ([70fc384](https://github.com/nuxt/fonts/commit/70fc384))
- Skip processing some known libraries ([827409b](https://github.com/nuxt/fonts/commit/827409b))
- Handle network errors fetching font metadata ([7be6d40](https://github.com/nuxt/fonts/commit/7be6d40))
- Add prefix in `data:` ([0a9bf59](https://github.com/nuxt/fonts/commit/0a9bf59))
- Display more info about fonts download ([72f1393](https://github.com/nuxt/fonts/commit/72f1393))
- **fontshare:** Return empty array when there's an error ([96accaa](https://github.com/nuxt/fonts/commit/96accaa))
- **transform:** Run additional transform step when rendering bundle ([d899315](https://github.com/nuxt/fonts/commit/d899315))
- **parse:** Handle unquoted multi-word font families ([5b72725](https://github.com/nuxt/fonts/commit/5b72725))
- **parse:** Use buffer strategy for parsing downloaded css ([362e2d4](https://github.com/nuxt/fonts/commit/362e2d4))
- **transform:** Inject fallback in correct location with multi word fonts ([3e67278](https://github.com/nuxt/fonts/commit/3e67278))
- Respect custom defaults via `families` ([d2c9ac1](https://github.com/nuxt/fonts/commit/d2c9ac1))
- **google:** Handle variable font weights ([4a9bc4d](https://github.com/nuxt/fonts/commit/4a9bc4d))
- Provide metrics for fallback ([4ada63d](https://github.com/nuxt/fonts/commit/4ada63d))
- Add `system-ui` fallbacks ([b707f62](https://github.com/nuxt/fonts/commit/b707f62))
- Use fallback font, not rendered name ([0c32d01](https://github.com/nuxt/fonts/commit/0c32d01))

### 💅 Refactors

- Rename variable ([f5011c9](https://github.com/nuxt/fonts/commit/f5011c9))
- **google:** Split out api client ([dbd736a](https://github.com/nuxt/fonts/commit/dbd736a))
- **google:** Slight refactor ([e369485](https://github.com/nuxt/fonts/commit/e369485))
- Share default variants ([1dee25e](https://github.com/nuxt/fonts/commit/1dee25e))
- **google:** Use native google apis ([8399b32](https://github.com/nuxt/fonts/commit/8399b32))

### 📖 Documentation

- Update roadmap ([19e7a3d](https://github.com/nuxt/fonts/commit/19e7a3d))
- Update todo ([59e1189](https://github.com/nuxt/fonts/commit/59e1189))
- Update roadmap ([856fad8](https://github.com/nuxt/fonts/commit/856fad8))
- Add initial project documentation ([bf0c2e2](https://github.com/nuxt/fonts/commit/bf0c2e2))
- Mention tailwind/uno support and deep scan of directories ([a27900d](https://github.com/nuxt/fonts/commit/a27900d))

### 🏡 Chore

- Repo init ([180e442](https://github.com/nuxt/fonts/commit/180e442))
- Allow accessing private repo ([e0ac3e9](https://github.com/nuxt/fonts/commit/e0ac3e9))
- Add renovate configuration ([f8b300a](https://github.com/nuxt/fonts/commit/f8b300a))
- Add `playwright-core` ([3e6f82d](https://github.com/nuxt/fonts/commit/3e6f82d))
- Add build command ([e755ac4](https://github.com/nuxt/fonts/commit/e755ac4))
- Add links to playground ([9771234](https://github.com/nuxt/fonts/commit/9771234))
- Improve type testing step ([86ee4d7](https://github.com/nuxt/fonts/commit/86ee4d7))
- Remove old attribution ([80a5a57](https://github.com/nuxt/fonts/commit/80a5a57))
- Add missing `unstorage` dependency ([58ad293](https://github.com/nuxt/fonts/commit/58ad293))
- Fix repository format ([1c2ff7a](https://github.com/nuxt/fonts/commit/1c2ff7a))
- Add todo for unocss ([8d5f9d2](https://github.com/nuxt/fonts/commit/8d5f9d2))
- **playground:** Fix custom font path ([5d77a7d](https://github.com/nuxt/fonts/commit/5d77a7d))
- Make cache time more obvious ([c0a1d3d](https://github.com/nuxt/fonts/commit/c0a1d3d))
- Bump nuxt framework version ([92a8182](https://github.com/nuxt/fonts/commit/92a8182))

### ✅ Tests

- Update test cases ([ce1f4ae](https://github.com/nuxt/fonts/commit/ce1f4ae))
- Add more granular tests in suite ([a195a91](https://github.com/nuxt/fonts/commit/a195a91))
- Add test for `none` ([ddcc31a](https://github.com/nuxt/fonts/commit/ddcc31a))
- Add directories to clean up tests ([18947c4](https://github.com/nuxt/fonts/commit/18947c4))
- Add test/example for custom providers ([3dc5f54](https://github.com/nuxt/fonts/commit/3dc5f54))
- Update test case ([9f19d53](https://github.com/nuxt/fonts/commit/9f19d53))

### 🤖 CI

- Release package to nightly channel ([cb826b5](https://github.com/nuxt/fonts/commit/cb826b5))
- Grant read permissions to release script ([0c4eefb](https://github.com/nuxt/fonts/commit/0c4eefb))
- Disable provenance for now ([db81bc2](https://github.com/nuxt/fonts/commit/db81bc2))
- Disable differently ([38a44b1](https://github.com/nuxt/fonts/commit/38a44b1))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))

