export function extractFontFaces(fontFamily: string, html: string) {
  const matches = html.matchAll(new RegExp(`@font-face\\s*{[^}]*font-family:\\s*(?<quote>['"])?${fontFamily}\\k<quote>[^}]+}`, 'g'))
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
