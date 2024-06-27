import { globby } from 'globby'
import { anyOf, createRegExp, not, wordBoundary } from 'magic-regexp'
import { join, relative, resolve } from 'pathe'
import { filename } from 'pathe/utils'

import { withLeadingSlash, withTrailingSlash } from 'ufo'
import type { FontFaceData, FontProvider } from '../types'

const providerContext = {
  rootPaths: [] as string[],
  registry: {} as Record<string, string[]>,
}

export default {
  setup(_options, nuxt) {
    // TODO: rework when providers can respond with font metric data
    // Scan for all font files in public asset directories
    nuxt.hook('nitro:init', async (nitro) => {
      for (const assetsDir of nitro.options.publicAssets) {
        const possibleFontFiles = await globby('**/*.{ttf,woff,woff2,eot,otf}', {
          absolute: true,
          cwd: assetsDir.dir,
        })
        providerContext.rootPaths.push(withTrailingSlash(assetsDir.dir))
        for (const file of possibleFontFiles) {
          registerFont(file.replace(assetsDir.dir, join(assetsDir.dir, nuxt.options.app.baseURL || '/')))
        }
      }

      // Sort rootPaths so we resolve to most specific path first
      providerContext.rootPaths = providerContext.rootPaths.sort((a, b) => b.length - a.length)
    })

    // Update registry when files change
    nuxt.hook('builder:watch', (event, relativePath) => {
      relativePath = relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, relativePath))
      const path = resolve(nuxt.options.srcDir, relativePath)
      if (event === 'add' && isFontFile(path)) {
        registerFont(path)
      }
      if (event === 'unlink' && isFontFile(path)) {
        unregisterFont(path)
      }
    })
  },
  resolveFontFaces(fontFamily, defaults) {
    const fonts: FontFaceData[] = []

    // Resolve font files for each combination of weight, style and subset
    for (const weight of defaults.weights) {
      for (const style of defaults.styles) {
        for (const subset of defaults.subsets) {
          const resolved = lookupFont(fontFamily, [weightMap[weight] || weight, style, subset])
          if (resolved.length > 0) {
            fonts.push({
              src: resolved,
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

const FONT_RE = /\.(?:ttf|woff|woff2|eot|otf)(?:\?[^.]+)?$/
const NON_WORD_RE = /\W+/g

export const isFontFile = (id: string) => FONT_RE.test(id)

// TODO: support without hyphen
// TODO: support reading font metrics
const weightMap: Record<string, string> = {
  100: 'thin',
  200: 'extra-light',
  300: 'light',
  400: 'normal',
  500: 'medium',
  600: 'semi-bold',
  700: 'bold',
  800: 'extra-bold',
  900: 'black',
}

const weights = Object.entries(weightMap).flatMap(e => e).filter(r => r !== 'normal')
const WEIGHT_RE = createRegExp(anyOf(...new Set([...weights, ...weights.map(w => w.replace('-', ''))])).groupedAs('weight').after(not.digit).before(not.digit.or(wordBoundary)), ['i'])

const styles = ['italic', 'oblique'] as const
const STYLE_RE = createRegExp(anyOf(...styles).groupedAs('style').before(not.wordChar.or(wordBoundary)), ['i'])

const subsets = [
  'cyrillic-ext',
  'cyrillic',
  'greek-ext',
  'greek',
  'vietnamese',
  'latin-ext',
  'latin',
] as const
const SUBSET_RE = createRegExp(anyOf(...subsets).groupedAs('subset').before(not.wordChar.or(wordBoundary)), ['i'])

function generateSlugs(path: string) {
  let name = filename(path)

  const weight = name.match(WEIGHT_RE)?.groups?.weight || 'normal'
  const style = name.match(STYLE_RE)?.groups?.style || 'normal'
  const subset = name.match(SUBSET_RE)?.groups?.subset || 'latin'

  for (const slug of [weight, style, subset]) {
    name = name.replace(slug, '')
  }

  const slugs = new Set<string>()

  for (const slug of [name.replace(/\.\w*$/, ''), name.replace(/[._-]\w*$/, '')]) {
    slugs.add([
      fontFamilyToSlug(slug.replace(/[\W_]+$/, '')),
      weightMap[weight] || weight,
      style,
      subset,
    ].join('-').toLowerCase())
  }

  return [...slugs]
}

function registerFont(path: string) {
  const slugs = generateSlugs(path)
  for (const slug of slugs) {
    providerContext.registry[slug] ||= []
    providerContext.registry[slug]!.push(path)
  }
}

function unregisterFont(path: string) {
  const slugs = generateSlugs(path)
  for (const slug of slugs) {
    providerContext.registry[slug] ||= []
    providerContext.registry[slug] = providerContext.registry[slug]!.filter(p => p !== path)
  }
}

const extensionPriority = ['woff2', 'woff', 'ttf', 'otf', 'eot']
function lookupFont(family: string, suffixes: Array<string | number>): string[] {
  const slug = [fontFamilyToSlug(family), ...suffixes].join('-')
  const paths = providerContext.registry[slug]
  if (!paths || paths.length === 0) {
    return []
  }

  const fonts = new Set<string>()
  for (const path of paths) {
    const base = providerContext.rootPaths.find(root => path.startsWith(root))
    fonts.add(base ? withLeadingSlash(relative(base, path)) : path)
  }

  return [...fonts].sort((a, b) => {
    const extA = filename(a).split('.').pop()!
    const extB = filename(b).split('.').pop()!

    return extensionPriority.indexOf(extA) - extensionPriority.indexOf(extB)
  })
}

function fontFamilyToSlug(family: string) {
  return family.toLowerCase().replace(NON_WORD_RE, '')
}
