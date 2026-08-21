// Well-known Google Fonts subset ranges, keyed by their first (normalised)
// unicode range, so hashed font filenames can be labelled with the subset they
// contain rather than an opaque hash.
const SUBSETS: Record<string, string> = {
  'U+0-FF': 'latin',
  'U+100-2BA': 'latin-ext',
  'U+102-103': 'vietnamese',
  'U+301': 'cyrillic',
  'U+370-377': 'greek',
  'U+460-52F': 'cyrillic-ext',
  'U+1F00-1FFF': 'greek-ext',
}

const FONT_FACE_RE = /@font-face\s*\{[^}]*\}/g
// Hashed font asset URLs, either absolute (remote provider) or served from the
// module's own asset directory, optionally relative to an emitted stylesheet.
const FONT_URL_RE = /(?<=['"(])(https?:\/\/[^/'")]+|(?:\.\.)?\/_fonts)\/([^'")]+)(?=['")])/g
// The same URLs as `FONT_URL_RE`, but as a bare (unquoted) `href` value.
const HREF_URL_RE = /^(.*?\/_fonts|https?:\/\/[^/]+)\/([^/]+)$/

export function extractFontFaces(fontFamily: string, html: string) {
  const labels = buildAssetLabels(html)
  // Newer minifiers (vite 8 / lightningcss) drop the quotes around the family
  // name and CSS-escape the `:` in fallback families, e.g.
  // `font-family:Oswald Fallback\: Times New Roman`. Allow an optional escaping
  // backslash before each colon so both serialisations match.
  const familyPattern = fontFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:/g, '\\\\?:')
  // Anchor the family name to the end of the `font-family` value (`;`) so that
  // `extractFontFaces('Poppins')` does not also match unquoted fallback
  // families like `font-family:Poppins Fallback\: Arial`.
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*(?<quote>['"])?${familyPattern}\\k<quote>;[^}]*}`, 'g'))
  return Array.from(matches, match => normalizeFontFace(labelAssetURLs(match[0], labels)))
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

function descriptor(css: string, name: string) {
  const value = css.match(new RegExp(`(?:[{;])\\s*${name}:\\s*([^;}]+)`))?.[1]?.trim()
  return value?.replace(/^(['"])((?:[^\\]|\\.)*)\1$/, '$2').replace(/\\(.)/g, '$1')
}

/**
 * Derive a human-readable label for every hashed font asset referenced in `html`,
 * built from the `@font-face` descriptors that point at it (family, weight, style,
 * subset). Distinct assets that describe the same face get a numeric suffix, so a
 * duplicated download shows up in a snapshot as `font-latin.woff2` alongside
 * `font-latin-2.woff2` rather than as two indistinguishable hashes.
 */
function buildAssetLabels(...sources: string[]) {
  const labels = new Map<string, string>()
  const counts = new Map<string, number>()

  for (const [css] of sources.join('\n').matchAll(FONT_FACE_RE)) {
    const family = descriptor(css, 'font-family') || 'font'
    const weight = descriptor(css, 'font-weight') || '400'
    const style = descriptor(css, 'font-style') || 'normal'
    const range = descriptor(css, 'unicode-range')
    const subset = range && (SUBSETS[normalizeUnicodeRange(range.split(',')[0]!)] || normalizeUnicodeRange(range.split(',')[0]!).toLowerCase().replace('+', ''))

    const parts = [family, weight, style === 'normal' ? undefined : style, subset]
    const base = parts.filter(Boolean).join(' ').toLowerCase().replace(/[^a-z0-9]+/g, '-')

    for (const [, , file] of css.matchAll(FONT_URL_RE)) {
      if (labels.has(file!)) {
        continue
      }
      const extension = file!.match(/\.[^.]+$/)?.[0] || ''
      const key = base + extension
      const count = (counts.get(key) || 0) + 1
      counts.set(key, count)
      labels.set(file!, count === 1 ? key : `${base}-${count}${extension}`)
    }
  }

  return labels
}

function label(file: string, labels: Map<string, string>) {
  return labels.get(file) || `file${file.match(/\.[^.]+$/)?.[0] || ''}`
}

function labelAssetURLs(css: string, labels: Map<string, string>) {
  return css.replace(FONT_URL_RE, (_, prefix, file) => `${prefix}/${label(file, labels)}`)
}

/**
 * Extract font preload hrefs, labelling hashed assets using the `@font-face` rules
 * found in `html`. Pass any external stylesheets as additional arguments when the
 * rules are not inlined into the document; assets that cannot be matched to a rule
 * fall back to the unidentifiable `file` placeholder.
 */
export function extractPreloadLinks(html?: string, ...stylesheets: string[]) {
  const labels = buildAssetLabels(html || '', ...stylesheets)
  return (html?.match(/<link[^>]+rel="preload"[^>]+>/g) || [])
    .filter(m => !m.includes('_nuxt'))
    .map(link => link.match(/href="([^"]+)"/)?.[1]?.replace(HREF_URL_RE, (_, prefix, file) => `${prefix}/${label(file, labels)}`))
}
