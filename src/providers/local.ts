import { globby } from 'globby'
import { join, relative, resolve } from 'pathe'
import { filename } from 'pathe/utils'

import type { FontFaceData, FontProvider } from '../types'
import { withLeadingSlash, withTrailingSlash } from 'ufo'

const providerContext = {
  rootPaths: [] as string[],
  registry: {} as Record<string, string[]>,
}

export default {
  async setup (_options, nuxt) {
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
  resolveFontFaces (fontFamily, defaults) {
    const fonts: FontFaceData[] = []

    // Generate all possible permutations of font family names
    // and resolve the first one that exists
    for (const weight of defaults.weights) {
      const isDefaultWeight = weight === 'normal' || weight === 400
      for (const style of defaults.styles) {
        const isDefaultStyle = style === 'normal'
        for (const subset of defaults.subsets) {
          const isDefaultSubset = subset === 'latin'
          const options = [
            [weight, style, subset],
            [weight, subset, style],
            [style, weight, subset],
            [style, subset, weight],
            [subset, weight, style],
            [subset, style, weight],
            ...isDefaultWeight ? [[style, subset], [subset, style]] : [],
            ...isDefaultStyle ? [[weight, subset], [subset, weight]] : [],
            ...isDefaultSubset ? [[weight, style], [style, weight]] : [],
            ...(isDefaultStyle && isDefaultWeight) ? [[subset]] : [],
            ...(isDefaultStyle && isDefaultWeight && isDefaultSubset) ? [[]] : []
          ]
          const resolved = findFirst([fontFamily, fontFamily.replace(NON_WORD_RE, '-'), fontFamily.replace(NON_WORD_RE, '')], options)
          if (resolved) {
            fonts.push({
              src: [...new Set(resolved)],
              weight,
              style,
            })
          }
        }
      }
    }

    if (fonts.length > 0) {
      return {
        fonts,
      }
    }
  },
} satisfies FontProvider

const FONT_RE = /\.(ttf|woff|woff2|eot|otf)(\?[^.]+)?$/
const NON_WORD_RE = /[^\w\d]+/g

export const isFontFile = (id: string) => FONT_RE.test(id)

function findFirst (families: string[], options: Array<string | number>[]) {
  for (const family of families) {
    for (const option of options) {
      const resolved = lookupFont([family, ...option].join('-')) || lookupFont([family, ...option].join(''))
      if (resolved) {
        return resolved
      }
    }
  }
}

function generateSlugs (path: string) {
  const name = filename(path)
  return [...new Set([
    name.toLowerCase(),
    // Barlow-das324jasdf => barlow
    name.replace(/-[\w\d]+$/, '').toLowerCase(),
    // Barlow.das324jasdf => barlow
    name.replace(/\.[\w\d]+$/, '').toLowerCase(),
    // Open+Sans => open-sans
    name.replace(NON_WORD_RE, '-').toLowerCase(),
    // Open+Sans => opensans
    name.replace(NON_WORD_RE, '').toLowerCase(),
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
  const slug = fontFamilyToSlug(family)
  const scannedFiles = providerContext.registry[slug]?.map(path => {
    const base = providerContext.rootPaths.find(root => path.startsWith(root))
    return base ? withLeadingSlash(relative(base, path)) : path
  })

  return scannedFiles?.sort((a, b) => {
    const extA = filename(a).split('.').pop()!
    const extB = filename(b).split('.').pop()!

    return priority.indexOf(extA) - priority.indexOf(extB)
  })
}

function fontFamilyToSlug (family: string) {
  return family.toLowerCase().replace(NON_WORD_RE, '')
}
