import { describe, expect, it } from 'vitest'
import { createResolver, generateFontFace, normalizeFontData } from 'fontless'
import { defineFontProvider } from 'unifont'
import type { Provider } from 'unifont'

const stubProvider = defineFontProvider('stub', () => ({
  resolveFont: () => ({
    fonts: [{
      src: [{ url: 'https://example.com/stub.woff2', format: 'woff2' }],
      weight: 400,
      style: 'normal' as const,
      display: 'auto' as const,
      unicodeRange: ['U+0000-00FF'],
    }],
  }),
}))

async function resolveCSS(override: Record<string, unknown>) {
  const resolveFontFace = await createResolver({
    options: { families: [override as never], experimental: { disableLocalFallbacks: true } },
    providers: { stub: stubProvider as unknown as (options: unknown) => Provider },
    normalizeFontData: faces => normalizeFontData({
      dev: false,
      renderedFontURLs: new Map(),
      assetsBaseURL: '/_fonts',
    }, faces),
  })
  const result = await resolveFontFace(override.name as string, override as never)
  return (result?.fonts || []).map(font => generateFontFace(override.name as string, font))
}

describe('family-level overrides', () => {
  it('should apply `display` to provider-resolved font faces', async () => {
    const css = await resolveCSS({ name: 'Stub Font', provider: 'stub', display: 'optional' })
    expect(css.join('\n')).toContain('font-display: optional;')
  })

  it('should apply `unicodeRange` to provider-resolved font faces', async () => {
    const css = await resolveCSS({ name: 'Stub Font', provider: 'stub', unicodeRange: ['U+0040'] })
    expect(css.join('\n')).toContain('unicode-range: U+0040;')
  })

  it('should apply overrides when the provider is resolved automatically', async () => {
    const css = await resolveCSS({ name: 'Stub Font', display: 'block', unicodeRange: 'U+0041' })
    expect(css.join('\n')).toContain('font-display: block;')
    expect(css.join('\n')).toContain('unicode-range: U+0041;')
  })

  it('should apply all `@font-face` descriptors to manually declared fonts', async () => {
    const css = await resolveCSS({
      name: 'Manual Font',
      src: '/manual.woff2',
      display: 'optional',
      unicodeRange: ['U+0040'],
      stretch: 'expanded',
      featureSettings: '"liga" 0',
      variationSettings: '"wght" 400',
    })
    expect(css.join('\n')).toMatchInlineSnapshot(`
      "@font-face {
        font-family: 'Manual Font';
        src: url("/manual.woff2") format(woff2);
        font-display: optional;
        unicode-range: U+0040;
        font-stretch: expanded;
        font-feature-settings: "liga" 0;
        font-variation-settings: "wght" 400;
      }"
    `)
  })
})
