import { globby } from 'globby'
import { join, relative, resolve } from 'pathe'
import { filename } from 'pathe/utils'

import type { FontProvider } from '../types'
import { withLeadingSlash, withTrailingSlash } from 'ufo'

const providerContext = {
  rootPaths: [] as string[],
  registry: {} as Record<string, string[]>,
}

export default {
  async setup (nuxt) {
    // Scan for all font files in public directories
    for (const layer of nuxt.options._layers) {
      const publicDir = join(layer.config.srcDir || layer.cwd, layer.config.dir?.public || 'public')
      const possibleFontFiles = await globby('**/*.{ttf,woff,woff2,eot,otf}', {
        absolute: true,
        cwd: publicDir
      })
      providerContext.rootPaths.push(withTrailingSlash(publicDir))
      for (const file of possibleFontFiles) {
        registerFont(file)
      }
    }

    // Sort rootPaths so we resolve to most specific path first
    providerContext.rootPaths = providerContext.rootPaths.sort((a, b) => b.length - a.length)

    // Update registry when files change
    nuxt.hook('builder:watch', (event, relativePath) => {
      const path = resolve(nuxt.options.srcDir, relativePath)
      if (event === 'add' && isFontFile(path)) {
        registerFont(path)
      }
      if (event === 'unlink' && isFontFile(path)) {
        unregisterFont(path)
      }
    })
  },
  resolveFontFaces (fontFamily) {
    const weights = {
      regular: 400,
      bold: 700,
    }
    const styles = {
      regular: 'normal',
      italic: 'italic',
    }
    const fonts = []
    for (const weight in weights) {
      for (const style in styles) {
        const resolved = lookupFont(fontFamily + '-' + weight + '-' + style)
        if (resolved) {
          fonts.push({
            src: resolved,
            weight: weights[weight],
            style: styles[style],
          })
        }
      }
    }
    const resolved = [
      lookupFont(fontFamily + '-regular'),
      lookupFont(fontFamily)
    ]
    if (resolved) {
      return {
        fonts: [
          { src: resolved }
        ],
      }
    }
  },
} satisfies FontProvider

const FONT_RE = /\.(ttf|woff|woff2|eot|otf)(\?[^.]+)?$/
export const isFontFile = (id: string) => FONT_RE.test(id)

function generateSlugs (path: string) {
  const name = filename(path)
  return [...new Set([
    name.toLowerCase(),
    // Barlow-das324jasdf => barlow
    name.replace(/-[\w\d]+$/, '').toLowerCase(),
    // Barlow.das324jasdf => barlow
    name.replace(/\.[\w\d]+$/, '').toLowerCase(),
    // Open+Sans => open-sans
    name.replace(/\+/g, '-').toLowerCase(),
  ])]
}

function registerFont (path: string) {
  const slugs = generateSlugs(path)
  for (const slug of slugs) {
    providerContext.registry[slug] ||= []
    providerContext.registry[slug]!.push(path)
  }
}

function unregisterFont (path: string) {
  const slugs = generateSlugs(path)
  for (const slug of slugs) {
    providerContext.registry[slug] ||= []
    providerContext.registry[slug] = providerContext.registry[slug]!.filter(p => p !== path)
  }
}

function lookupFont (family: string): string[] | undefined {
  const priority = ['woff2', 'woff', 'ttf', 'otf', 'eot']
  const scannedFiles = providerContext.registry[family.toLowerCase()]?.map(path => {
    const base = providerContext.rootPaths.find(root => path.startsWith(root))
    return base ? withLeadingSlash(relative(base, path)) : path
  })

  return scannedFiles?.sort((a, b) => {
    const extA = filename(a).split('.').pop()!
    const extB = filename(b).split('.').pop()!

    return priority.indexOf(extA) - priority.indexOf(extB)
  })
}
