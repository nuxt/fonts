export function extractFontFaces(fontFamily: string, html: string) {
  // Newer minifiers (vite 8 / lightningcss) drop the quotes around the family
  // name and CSS-escape the `:` in fallback families, e.g.
  // `font-family:Oswald Fallback\: Times New Roman`. Allow an optional escaping
  // backslash before each colon so both serialisations match.
  const familyPattern = fontFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:/g, '\\\\?:')
  // Anchor the family name to the end of the `font-family` value (`;`) so that
  // `extractFontFaces('Poppins')` does not also match unquoted fallback
  // families like `font-family:Poppins Fallback\: Arial`.
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*(?<quote>['"])?${familyPattern}\\k<quote>;[^}]*}`, 'g'))
  return Array.from(matches, match => normalizeFontFace(match[0]
    .replace(/(?<=['"(])(https?:\/\/[^/]+|(?:..)?\/_fonts)\/[^")]+(\.[^".)]+)(?=['")])/g, '$1/file$2')
    .replace(/(?<=['"(])(https?:\/\/[^/]+|(?:..)?\/_fonts)\/[^".)]+(?=['")])/g, '$1/file')),
  )
}

// The exact CSS serialisation of an `@font-face` rule depends on the minifier:
// vite 7 / esbuild keeps `local("X")`, `format(woff2)`, zero-padded `unicode-range`
// codepoints and full-precision metric overrides, while vite 8 / lightningcss emits
// `local(X)`, `format("woff2")`, `U+??`-style wildcards and f32 6-significant-digit
// metrics. Fold both into one canonical shape so a single snapshot holds across minifiers.
function normalizeFontFace(css: string) {
  return css
    .replace(/local\((['"])((?:[^'"\\]|\\.)*)\1\)/g, (_, _q, name) => `local(${name})`)
    .replace(/\)\s*format\((['"]?)([^)]*?)\1\)/g, ') format($2)')
    .replace(/font-family:(['"]?)((?:[^'";\\]|\\.)*)\1;/, (_, _q, name) => `font-family:${name.replace(/\\(.)/g, '$1')};`)
    .replace(/unicode-range:([^;}]+)/, (_, list) => `unicode-range:${(list as string).split(',').map(normalizeUnicodeRange).join(',')}`)
    // lightningcss stores CSS numbers as f32 and prints them to 6 significant
    // digits; mirror that so the more precise esbuild serialisation collapses onto
    // the same value.
    .replace(/(\d+\.\d+)%/g, (_, n) => `${Number.parseFloat(Math.fround(Number.parseFloat(n)).toPrecision(6))}%`)
    // lightningcss reorders `@font-face` descriptors (e.g. `font-display` moves
    // after `src`) whereas esbuild preserves source order; sort them so the block
    // is order-independent.
    .replace(/(@font-face\s*\{)([^}]*)\}/g, (_, head, body) => `${head}${(body as string).split(';').filter(Boolean).sort().join(';')}}`)
}

function normalizeUnicodeRange(token: string) {
  const match = token.trim().match(/^U\+([0-9A-Fa-f?]+)(?:-([0-9A-Fa-f]+))?$/)
  if (!match) {
    return token.trim()
  }
  let [, start, end] = match
  if (start!.includes('?')) {
    end = start!.replace(/\?/g, 'F')
    start = start!.replace(/\?/g, '0')
  }
  const strip = (hex: string) => hex.replace(/^0+(?=.)/, '').toUpperCase()
  return end ? `U+${strip(start!)}-${strip(end)}` : `U+${strip(start!)}`
}

export function extractPreloadLinks(html?: string) {
  return (html?.match(/<link[^>]+rel="preload"[^>]+>/g) || [])
    .filter(m => !m.includes('_nuxt'))
    .map(link => link.match(/href="([^"]+)"/)?.[1]?.replace(/\/_fonts\/[^")]+(\.[^".)]+)$/g, '/file$1'))
}
