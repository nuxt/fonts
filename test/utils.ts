export function extractFontFaces(fontFamily: string, html: string) {
  // Newer minifiers (vite 8 / lightningcss) drop the quotes around the family
  // name and CSS-escape the `:` in fallback families, e.g.
  // `font-family:Oswald Fallback\: Times New Roman`. Allow an optional escaping
  // backslash before each colon so both serialisations match.
  const familyPattern = fontFamily.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:/g, '\\\\?:')
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*(?<quote>['"])?${familyPattern}\\k<quote>[^}]+}`, 'g'))
  return Array.from(matches, match => match[0]
    .replace(/(?<=['"(])(https?:\/\/[^/]+|(?:..)?\/_fonts)\/[^")]+(\.[^".)]+)(?=['")])/g, '$1/file$2')
    .replace(/(?<=['"(])(https?:\/\/[^/]+|(?:..)?\/_fonts)\/[^".)]+(?=['")])/g, '$1/file'),
  )
}

export function extractPreloadLinks(html?: string) {
  return (html?.match(/<link[^>]+rel="preload"[^>]+>/g) || [])
    .filter(m => !m.includes('_nuxt'))
    .map(link => link.match(/href="([^"]+)"/)?.[1]?.replace(/\/_fonts\/[^")]+(\.[^".)]+)$/g, '/file$1'))
}
