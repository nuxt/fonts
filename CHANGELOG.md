# Changelog


## v0.11.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.10.3...v0.11.0)

### 🚀 Enhancements

- **devtools:** Display font file size in devtools ([#462](https://github.com/nuxt/fonts/pull/462))
- Process CSS variables prefixed with `--font` by default ([#515](https://github.com/nuxt/fonts/pull/515))

### 🔥 Performance

- Drop `chalk` dependency ([7350140](https://github.com/nuxt/fonts/commit/7350140))

### 🩹 Fixes

- Add `consola` to dependencies ([afb3807](https://github.com/nuxt/fonts/commit/afb3807))

### 📖 Documentation

- Clarify that local provider does not load weights and styles as available automatically ([#502](https://github.com/nuxt/fonts/pull/502))

### 📦 Build

- ⚠️  Remove cjs outputs + use `@nuxt/module-builder` alpha ([#428](https://github.com/nuxt/fonts/pull/428))

### 🏡 Chore

- Move `useFlatConfig` out of `experimental` ([775a2f0](https://github.com/nuxt/fonts/commit/775a2f0))
- Move `useFlatConfig` out of `experimental` ([27b011a](https://github.com/nuxt/fonts/commit/27b011a))
- Remove superfluous check ([220ebbb](https://github.com/nuxt/fonts/commit/220ebbb))
- **deps-dev:** Bump vite from 6.0.7 to 6.0.9 in the npm_and_yarn group across 1 directory ([#463](https://github.com/nuxt/fonts/pull/463))
- Remove legacy types file ([3b50f81](https://github.com/nuxt/fonts/commit/3b50f81))
- Remove cjs output ([0e417e0](https://github.com/nuxt/fonts/commit/0e417e0))
- Remove `shiki` as devDependency ([#519](https://github.com/nuxt/fonts/pull/519))

### ✅ Tests

- Filter out manifest preload ([d2b1c84](https://github.com/nuxt/fonts/commit/d2b1c84))
- Separate playgrounds for different css frameworks ([#470](https://github.com/nuxt/fonts/pull/470))

### 🤖 CI

- Release via pkg.pr.new ([ad00403](https://github.com/nuxt/fonts/commit/ad00403))
- Move pkg.pr.new step to release workflow ([656866d](https://github.com/nuxt/fonts/commit/656866d))
- Force latest corepack ([c1f2889](https://github.com/nuxt/fonts/commit/c1f2889))

#### ⚠️ Breaking Changes

- ⚠️  Remove cjs outputs + use `@nuxt/module-builder` alpha ([#428](https://github.com/nuxt/fonts/pull/428))

### ❤️ Contributors

- Tom Tang ([@qwerzl](https://github.com/qwerzl))
- Daniel Roe ([@danielroe](https://github.com/danielroe))
- Jonas Schade ([@DerZade](https://github.com/DerZade))

## v0.10.3

[compare changes](https://github.com/nuxt/fonts/compare/v0.10.2...v0.10.3)

### 🩹 Fixes

- **devtools:** Re-broadcast all fonts when adding new ones ([#405](https://github.com/nuxt/fonts/pull/405))
- Parse nested CSS correctly ([#384](https://github.com/nuxt/fonts/pull/384))

### 📖 Documentation

- Add examples to local file lookup docs ([#398](https://github.com/nuxt/fonts/pull/398))
- Call out limited default font-weights ([#399](https://github.com/nuxt/fonts/pull/399))
- Update tailwind v4 example ([#410](https://github.com/nuxt/fonts/pull/410))

### 🏡 Chore

- **release:** V0.10.2 ([a7f0a7d](https://github.com/nuxt/fonts/commit/a7f0a7d))
- Default `bumpType` to patch in changelog script ([#402](https://github.com/nuxt/fonts/pull/402))

### ❤️ Contributors

- Max ([@onmax](http://github.com/onmax))
- Wayne Gibson ([@waynegibson](http://github.com/waynegibson))
- Rijk Van Zanten ([@rijkvanzanten](http://github.com/rijkvanzanten))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.10.2

[compare changes](https://github.com/nuxt/fonts/compare/v0.10.1...v0.10.2)

### 🩹 Fixes

- Write stub files in cache to trigger public asset handling ([#352](https://github.com/nuxt/fonts/pull/352))
- De-default custom provider imports ([#353](https://github.com/nuxt/fonts/pull/353))

### ✅ Tests

- Set `coverage.include` path ([36e5e08](https://github.com/nuxt/fonts/commit/36e5e08))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.10.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.10.0...v0.10.1)

### 🩹 Fixes

- Mark `module.d.mts` as type entrypoint ([be6fafc](https://github.com/nuxt/fonts/commit/be6fafc))

### 🏡 Chore

- Remove playwright caching ([39ec80f](https://github.com/nuxt/fonts/commit/39ec80f))

### ✅ Tests

- Update with latest provider snapshots ([5923b12](https://github.com/nuxt/fonts/commit/5923b12))

### 🤖 CI

- Run test suite on windows ([#339](https://github.com/nuxt/fonts/pull/339))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.10.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.9.2...v0.10.0)

### 🩹 Fixes

- Scan font families declared in `font:` ([#299](https://github.com/nuxt/fonts/pull/299))

### 💅 Refactors

- Use `jiti.import` to resolve custom providers ([#308](https://github.com/nuxt/fonts/pull/308))
- ⚠️  Migrate to `unifont` to handle providers ([#315](https://github.com/nuxt/fonts/pull/315))

### 📖 Documentation

- Update link to downloads count badge ([0a5742f](https://github.com/nuxt/fonts/commit/0a5742f))
- Update link to downloads count badge ([1cbb70f](https://github.com/nuxt/fonts/commit/1cbb70f))

### 🏡 Chore

- Use `pnpm` to run release ([dbbf438](https://github.com/nuxt/fonts/commit/dbbf438))

### ✅ Tests

- Adjust css regexp ([f8cd4eb](https://github.com/nuxt/fonts/commit/f8cd4eb))

#### ⚠️ Breaking Changes

- ⚠️  Migrate to `unifont` to handle providers ([#315](https://github.com/nuxt/fonts/pull/315))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.9.2

[compare changes](https://github.com/nuxt/fonts/compare/v0.9.1...v0.9.2)

### 🩹 Fixes

- Use earlier hooks to mark build done ([0311651](https://github.com/nuxt/fonts/commit/0311651))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.9.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.9.0...v0.9.1)

### 🩹 Fixes

- Serve fonts from `baseURL` in dev mode ([1fae926](https://github.com/nuxt/fonts/commit/1fae926))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.9.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.8.0...v0.9.0)

### 🚀 Enhancements

- Serve font files without nitro in `spa` mode ([95e4f44](https://github.com/nuxt/fonts/commit/95e4f44))

### 🩹 Fixes

- **local:** Use `extname` for extension priority test ([b087d47](https://github.com/nuxt/fonts/commit/b087d47))
- Emit `.cjs` version of `@nuxt/fonts/utils` ([10ca0c8](https://github.com/nuxt/fonts/commit/10ca0c8))
- Transform inline styles after other bundle hooks ([9156b8a](https://github.com/nuxt/fonts/commit/9156b8a))
- Only overwrite `cacheDir` after a fresh build ([#273](https://github.com/nuxt/fonts/pull/273))
- Add global `preload` links to entry chunk ([#274](https://github.com/nuxt/fonts/pull/274))

### 📖 Documentation

- Update installation ([#251](https://github.com/nuxt/fonts/pull/251))
- Various improvements ✨ ([#253](https://github.com/nuxt/fonts/pull/253))
- Remove incorrect `src` examples ([ca44e0d](https://github.com/nuxt/fonts/commit/ca44e0d))
- Improve wording ([c771e86](https://github.com/nuxt/fonts/commit/c771e86))
- Add note about how how `font-family` declarations are handled ([df2685d](https://github.com/nuxt/fonts/commit/df2685d))

### 🏡 Chore

- **release:** V0.8.0 ([2b87589](https://github.com/nuxt/fonts/commit/2b87589))
- Dedupe lockfile and remove `execa` ([86ba934](https://github.com/nuxt/fonts/commit/86ba934))
- Dedupe lockfile ([500bf45](https://github.com/nuxt/fonts/commit/500bf45))
- Lint ([0fb0157](https://github.com/nuxt/fonts/commit/0fb0157))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Sébastien Chopin ([@atinux](http://github.com/atinux))

## v0.8.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.7.2...v0.8.0)

### 🚀 Enhancements

- `googleicons` provider ([#133](https://github.com/nuxt/fonts/pull/133))
- Allow experimentally disabling local fallbacks ([#225](https://github.com/nuxt/fonts/pull/225))

### 🩹 Fixes

- Inject relative font urls in css ([b7646e9](https://github.com/nuxt/fonts/commit/b7646e9))

### 💅 Refactors

- **devtools:** Improve devtools ui ([#228](https://github.com/nuxt/fonts/pull/228))

### 📖 Documentation

- Warn to escape invalid characters in Tailwind config ([#233](https://github.com/nuxt/fonts/pull/233))

### 🏡 Chore

- Add `compatibilityDate` field ([bd6a7da](https://github.com/nuxt/fonts/commit/bd6a7da))

### ✅ Tests

- Extract test helpers ([572f3ca](https://github.com/nuxt/fonts/commit/572f3ca))

### ❤️ Contributors

- Tom Tang ([@qwerzl](http://github.com/qwerzl))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Arash ([@arashsheyda](http://github.com/arashsheyda))

## v0.7.2

[compare changes](https://github.com/nuxt/fonts/compare/v0.7.1...v0.7.2)

### 🔥 Performance

- **local:** Use `tinyglobby` to scan font files ([#205](https://github.com/nuxt/fonts/pull/205))

### 🩹 Fixes

- Apply `-` replacement to filename ([d83aa0d](https://github.com/nuxt/fonts/commit/d83aa0d))
- **adobe:** Use provided `css_names` from API ([#192](https://github.com/nuxt/fonts/pull/192))
- **fontsource:** Use `/variable` endpoint for retrieving variable axes ([#196](https://github.com/nuxt/fonts/pull/196))

### 📖 Documentation

- Fix link to how it works ([#197](https://github.com/nuxt/fonts/pull/197))
- Update carbon abs ([7b61b15](https://github.com/nuxt/fonts/commit/7b61b15))
- Improvements ([9dab0a3](https://github.com/nuxt/fonts/commit/9dab0a3))
- Update social og image ([2991df2](https://github.com/nuxt/fonts/commit/2991df2))
- Fix open an issue link on installation page ([#206](https://github.com/nuxt/fonts/pull/206))

### 🏡 Chore

- Lint ([dabc1ce](https://github.com/nuxt/fonts/commit/dabc1ce))

### ✅ Tests

- Update snapshots ([5bc9ae6](https://github.com/nuxt/fonts/commit/5bc9ae6))

### ❤️ Contributors

- Ben McCann ([@benmccann](http://github.com/benmccann))
- Kethan Vegunta ([@kethan1](http://github.com/kethan1))
- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Sébastien Chopin ([@atinux](http://github.com/atinux))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))
- Michel EDIGHOFFER <edimitchel@gmail.com>

## v0.7.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.7.0...v0.7.1)

### 🩹 Fixes

- **local:** Scan for fonts in all public assets dirs ([6e7ae2b](https://github.com/nuxt/fonts/commit/6e7ae2b))
- Ensure we don't have font filenames prefixed with `-` ([dfa252a](https://github.com/nuxt/fonts/commit/dfa252a))

### 📖 Documentation

- Add docs page ([#146](https://github.com/nuxt/fonts/pull/146))
- Update home page links ([8c91318](https://github.com/nuxt/fonts/commit/8c91318))
- Two more links ([5af0e5e](https://github.com/nuxt/fonts/commit/5af0e5e))

### 🏡 Chore

- Add CODEOWNERS file ([#156](https://github.com/nuxt/fonts/pull/156))
- Lint ([1632eee](https://github.com/nuxt/fonts/commit/1632eee))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.7.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.6.1...v0.7.0)

### 🚀 Enhancements

- Allow configuring `font-stretch` property in override ([d7ff458](https://github.com/nuxt/fonts/commit/d7ff458))
- Add `preload` override + preload non subsetted fonts ([#136](https://github.com/nuxt/fonts/pull/136))

### 🩹 Fixes

- Do not apply ignore patterns to `_fonts` public dir ([4952673](https://github.com/nuxt/fonts/commit/4952673))

### 📖 Documentation

- Clarify that `addPreloadLinks` only affects production ([d3cbcdb](https://github.com/nuxt/fonts/commit/d3cbcdb))
- **readme:** Replace provider count ([#125](https://github.com/nuxt/fonts/pull/125))

### 🏡 Chore

- Migrate to eslint v9 ([#121](https://github.com/nuxt/fonts/pull/121))
- Lint ([7fa0ef5](https://github.com/nuxt/fonts/commit/7fa0ef5))
- Update to latest `@nuxt/module-builder` ([#139](https://github.com/nuxt/fonts/pull/139))

### 🤖 CI

- Add codecov token ([#140](https://github.com/nuxt/fonts/pull/140))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Jonas Thelemann <e-mail+github@jonas-thelemann.de>

## v0.6.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.6.0...v0.6.1)

### 🩹 Fixes

- Add style in variable font local fallback name ([#110](https://github.com/nuxt/fonts/pull/110))

### 📖 Documentation

- Add link to adobe's terms and warning to read ([7872b28](https://github.com/nuxt/fonts/commit/7872b28))
- Mention non-latin subset support for adobe provider ([#109](https://github.com/nuxt/fonts/pull/109))

### 🏡 Chore

- **release:** V0.6.0 ([0913b4b](https://github.com/nuxt/fonts/commit/0913b4b))

### ❤️ Contributors

- Tom Tang ([@qwerzl](http://github.com/qwerzl))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.6.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.5.1...v0.6.0)

### 🚀 Enhancements

- **fontsource:** Support variable fonts ([#102](https://github.com/nuxt/fonts/pull/102))

### 🩹 Fixes

- Render variable font weight correctly ([#99](https://github.com/nuxt/fonts/pull/99))
- Preserve `@font-face` order when rendering ([836a605](https://github.com/nuxt/fonts/commit/836a605))
- Only prepend once 🤣 and update snapshots ([8a000ae](https://github.com/nuxt/fonts/commit/8a000ae))
- Adopt forward-compatible approach to `builder:watch` ([#101](https://github.com/nuxt/fonts/pull/101))
- Handle custom `app.baseURL` in development ([d9f4fae](https://github.com/nuxt/fonts/commit/d9f4fae))

### 📖 Documentation

- Add image ([608653b](https://github.com/nuxt/fonts/commit/608653b))
- Mention disabling unocss web fonts preset ([627125b](https://github.com/nuxt/fonts/commit/627125b))

### 🏡 Chore

- Link to latest version in badges ([42e7030](https://github.com/nuxt/fonts/commit/42e7030))

### ✅ Tests

- Update poppins snapshot ([274ae5f](https://github.com/nuxt/fonts/commit/274ae5f))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))
- Sébastien Chopin ([@Atinux](http://github.com/Atinux))

## v0.5.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.5.0...v0.5.1)

### 🩹 Fixes

- Invalidate cache on new package releases ([ee9678a](https://github.com/nuxt/fonts/commit/ee9678a))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.5.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.4.0...v0.5.0)

### 🚀 Enhancements

- **fontsource:** Support subsets ([#84](https://github.com/nuxt/fonts/pull/84))

### 🩹 Fixes

- Inherit css preload data when chunks are bundled up ([c11b257](https://github.com/nuxt/fonts/commit/c11b257))
- Continue if font family doesn't match in `getFontDetails` ([#88](https://github.com/nuxt/fonts/pull/88))
- Handle numbers in font family names ([d3d3de6](https://github.com/nuxt/fonts/commit/d3d3de6))
- Handle escape characters in font family names ([777cb0f](https://github.com/nuxt/fonts/commit/777cb0f))

### 💅 Refactors

- Share storage instance between meta/assets ([d5b8184](https://github.com/nuxt/fonts/commit/d5b8184))
- Separate type import ([593117b](https://github.com/nuxt/fonts/commit/593117b))

### 🏡 Chore

- Dedupe dependencies ([4793b4c](https://github.com/nuxt/fonts/commit/4793b4c))

### ✅ Tests

- Clear font cache before running tests ([ff64cff](https://github.com/nuxt/fonts/commit/ff64cff))
- Add snapshots for adobe provider ([c1dc27e](https://github.com/nuxt/fonts/commit/c1dc27e))
- Single adobe playground page ([76d7b8a](https://github.com/nuxt/fonts/commit/76d7b8a))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.4.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.3.0...v0.4.0)

### 🚀 Enhancements

- Fontsource provider ([#78](https://github.com/nuxt/fonts/pull/78))
- Support system proxy when fetching fonts/metadata ([#82](https://github.com/nuxt/fonts/pull/82))

### 🩹 Fixes

- Match font weights & styles when adding local fallbacks ([#71](https://github.com/nuxt/fonts/pull/71))

### 📖 Documentation

- Add adobe to list in readme ([9b0770d](https://github.com/nuxt/fonts/commit/9b0770d))

### 🏡 Chore

- **release:** V0.3.0 ([0fda07a](https://github.com/nuxt/fonts/commit/0fda07a))
- Fix lockfile ([6c3eff0](https://github.com/nuxt/fonts/commit/6c3eff0))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.3.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.2.1...v0.3.0)

### 🚀 Enhancements

- Add adobe fonts provider ([#55](https://github.com/nuxt/fonts/pull/55))

### ❤️ Contributors

- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.2.1

[compare changes](https://github.com/nuxt/fonts/compare/v0.2.0...v0.2.1)

### 🩹 Fixes

- **devtools:** Don't wait for callback from `exposeFonts` ([35758d6](https://github.com/nuxt/fonts/commit/35758d6))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v0.2.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.1.0...v0.2.0)

### 🚀 Enhancements

- Fall back to reading font metrics from remote sources ([78138b2](https://github.com/nuxt/fonts/commit/78138b2))
- Add nuxt devtools panel ([#45](https://github.com/nuxt/fonts/pull/45))
- Add experimental support for CSS variables ([0fa5d3a](https://github.com/nuxt/fonts/commit/0fa5d3a))
- Add experimental support for preload links ([50f66fc](https://github.com/nuxt/fonts/commit/50f66fc))

### 🔥 Performance

- Do not resolve esbuild options in dev ([7ac780a](https://github.com/nuxt/fonts/commit/7ac780a))

### 🩹 Fixes

- Respect vite esbuild options when transforming css ([541b08d](https://github.com/nuxt/fonts/commit/541b08d))
- Normalize weights before passing to `resolveFontFaces` ([#47](https://github.com/nuxt/fonts/pull/47))
- Normalize `unicodeRange` as well ([6a4247a](https://github.com/nuxt/fonts/commit/6a4247a))
- **devtools:** Reduce horizontal scrolling ([6f11a55](https://github.com/nuxt/fonts/commit/6f11a55))
- **devtools:** Colors in light mode ([#51](https://github.com/nuxt/fonts/pull/51))

### 💅 Refactors

- Pass originalURL via font sources ([67b0caa](https://github.com/nuxt/fonts/commit/67b0caa))

### 📖 Documentation

- Update example provider to use `defineFontProvider` ([b7bff82](https://github.com/nuxt/fonts/commit/b7bff82))
- Add example of `processCSSVariables` ([43e0f99](https://github.com/nuxt/fonts/commit/43e0f99))

### 🏡 Chore

- Do not use `defineFontProvider` in repo ([bc11360](https://github.com/nuxt/fonts/commit/bc11360))
- Don't use workspace protocol for devtools bootstrap ([a9c6207](https://github.com/nuxt/fonts/commit/a9c6207))
- Install carbon icons in root package as well ([db66211](https://github.com/nuxt/fonts/commit/db66211))
- Remove unused import ([e125f86](https://github.com/nuxt/fonts/commit/e125f86))

### ✅ Tests

- Add stub `lookupFontURL` function ([57b5eca](https://github.com/nuxt/fonts/commit/57b5eca))

### 🤖 CI

- Run type test before build as well ([191fea7](https://github.com/nuxt/fonts/commit/191fea7))

### ❤️ Contributors

- Daniel Roe ([@danielroe](http://github.com/danielroe))
- Arash ([@arashsheyda](http://github.com/arashsheyda))
- Tom Tang ([@qwerzl](http://github.com/qwerzl))

## v0.1.0

[compare changes](https://github.com/nuxt/fonts/compare/v0.0.2...v0.1.0)

### 🚀 Enhancements

- Expose font types from `@nuxt/fonts` ([a824bed](https://github.com/nuxt/fonts/commit/a824bed))
- Support `priority` and `provider` options ([bd8da26](https://github.com/nuxt/fonts/commit/bd8da26))

### 🩹 Fixes

- **local:** Deduplicate found fonts ([a44c4c4](https://github.com/nuxt/fonts/commit/a44c4c4))
- **local:** Refactor scanning/lookup mechanism ([#41](https://github.com/nuxt/fonts/pull/41))
- Warn when fonts can't be resolved because of an override ([#35](https://github.com/nuxt/fonts/pull/35))

### 🏡 Chore

- **release:** V0.0.2 ([a198293](https://github.com/nuxt/fonts/commit/a198293))
- Ignore wrangler build output ([1b93761](https://github.com/nuxt/fonts/commit/1b93761))

### 🎨 Styles

- Remove unused imports/args ([967cd21](https://github.com/nuxt/fonts/commit/967cd21))

### ❤️ Contributors

- Tom Tang ([@qwerzl](http://github.com/qwerzl))
- Daniel Roe ([@danielroe](http://github.com/danielroe))

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

