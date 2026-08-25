import { describe, it, expect } from 'vitest'

import { normalizeFontFace } from './utils'

/**
 * Each entry lists the ways a single `@font-face` rule is serialised across the
 * minifiers the playgrounds run through (esbuild keeps quotes, source order and
 * full-precision metrics; lightningcss drops quotes, escapes `:` in identifiers,
 * reorders descriptors, collapses unicode ranges to wildcards and rounds metrics
 * to f32). They all have to normalise to one string, otherwise a snapshot cannot
 * be shared between playgrounds on different Nuxt majors.
 */
const serialisations: Record<string, string[]> = {
  'remote font with subset': [
    '@font-face{font-family:Abel;src:local("Abel Regular"),local("Abel"),url(/_fonts/abel.woff2) format(woff2);font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153;font-weight:400;font-style:normal}',
    '@font-face{font-display:swap;font-family:Abel;font-style:normal;font-weight:400;src:local(Abel Regular),local(Abel),url(/_fonts/abel.woff2)format("woff2");unicode-range:U+??,U+131,U+152-153}',
  ],
  'generated fallback metrics': [
    '@font-face{font-family:"Lato Fallback: Arial";src:local("Arial");size-adjust:97.6894%;ascent-override:101.0345%;descent-override:21.8038%;line-gap-override:0%}',
    '@font-face{ascent-override:101.035%;descent-override:21.8038%;font-family:Lato Fallback\\: Arial;line-gap-override:0%;size-adjust:97.6894%;src:local(Arial)}',
  ],
  'manual override': [
    '@font-face{font-family:MyCustom;src:url(/custom-font.woff2) format(woff2);font-display:swap}',
    '@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2)format("woff2")}',
  ],
}

describe('font face normalisation', () => {
  for (const [name, variants] of Object.entries(serialisations)) {
    it(`is stable across minifiers for a ${name}`, () => {
      expect(new Set(variants.map(normalizeFontFace)).size).toBe(1)
    })
  }

  it('produces a canonical serialisation', () => {
    expect(Object.values(serialisations).map(([css]) => normalizeFontFace(css!))).toMatchInlineSnapshot(`
      [
        "@font-face{font-display:swap;font-family:Abel;font-style:normal;font-weight:400;src:local(Abel Regular),local(Abel),url(/_fonts/abel.woff2) format(woff2);unicode-range:U+0-FF,U+131,U+152-153}",
        "@font-face{ascent-override:101.035%;descent-override:21.8038%;font-family:Lato Fallback: Arial;line-gap-override:0%;size-adjust:97.6894%;src:local(Arial)}",
        "@font-face{font-display:swap;font-family:MyCustom;src:url(/custom-font.woff2) format(woff2)}",
      ]
    `)
  })
})
