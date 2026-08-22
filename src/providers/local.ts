import { glob } from 'tinyglobby'
import { join, extname, relative, resolve } from 'pathe'
import { filename } from 'pathe/utils'
import { anyOf, createRegExp, not, wordBoundary } from 'magic-regexp'
import { defineFontProvider } from 'unifont'
import { withLeadingSlash, withTrailingSlash } from 'ufo'
import { useNuxt } from '@nuxt/kit'
import type { FontFaceData, ResolveFontResult } from 'unifont'

import { parseFont } from 'fontless'

export default defineFontProvider('local', () => {
  const providerContext = {
    rootPaths: [] as string[],
    registry: {} as Record<string, string[]>,
  }

  const nuxt = useNuxt()

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

  const extensionPriority = ['.woff2', '.woff', '.ttf', '.otf', '.eot']
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
      const extA = extname(a)
      const extB = extname(b)

      return extensionPriority.indexOf(extA) - extensionPriority.indexOf(extB)
    })
  }

  // TODO: rework when providers can respond with font metric data
  // Scan for all font files in public asset directories
  nuxt.hook('nitro:init', async (nitro) => {
    for (const assetsDir of nitro.options.publicAssets) {
      const possibleFontFiles = await glob(['**/*.{ttf,woff,woff2,eot,otf}'], {
        absolute: true,
        cwd: assetsDir.dir,
      })
      providerContext.rootPaths.push(withTrailingSlash(assetsDir.dir))
      for (const file of possibleFontFiles) {
        registerFont(file.replace(assetsDir.dir, join(assetsDir.dir, assetsDir.baseURL || '/')))
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

  return {
    resolveFont(fontFamily, options): ResolveFontResult | undefined {
      const fonts: FontFaceData[] = []

      // Resolve font files for each combination of weight, style and subset
      for (const weight of options.weights) {
        for (const style of options.styles) {
          for (const subset of options.subsets) {
            const resolved = lookupFont(fontFamily, [normaliseWeight(weight), style, subset])
            if (resolved.length > 0) {
              fonts.push({
                src: resolved.map(url => parseFont(url)),
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
  }
})

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

const numericWeights = Object.keys(weightMap).map(Number)

/**
 * Variable weight ranges in filenames, e.g. `MyFont-100 900.woff2`, `MyFont-100-900.woff2`
 * or `MyFont.100-900.woff2`. Both bounds must be recognised CSS weights (multiples of 100
 * between 100 and 900), so `MyFont-300-234987akd.woff2` is still read as a single `300`
 * weight.
 */
const WEIGHT_RANGE_RE = /(?<!\d)(?<min>[1-9]00)[\s._-](?<max>[1-9]00)(?!\d)/

function matchWeightRange(value: string) {
  const match = value.match(WEIGHT_RANGE_RE)
  if (!match || Number(match.groups!.min) >= Number(match.groups!.max)) {
    return
  }
  return match
}

const VARIABLE_RE = /(?:^|[\W_])(?:variable|vf)(?:$|[\W_])/i

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

/**
 * Every weight key a variable font covering `min` to `max` should answer to: each named weight
 * within the range, plus every sub-range a user might declare in their config.
 */
function variableWeightKeys(min: number, max: number) {
  const covered = numericWeights.filter(weight => weight >= min && weight <= max)
  const keys = covered.map(weight => weightMap[weight]!)
  for (const from of covered) {
    for (const to of covered) {
      if (from < to) {
        keys.push(`${from}-${to}`)
      }
    }
  }
  return keys
}

function generateSlugs(path: string) {
  let name = filename(path) || path

  const range = matchWeightRange(name)
  const weight = range ? undefined : name.match(WEIGHT_RE)?.groups?.weight || 'normal'
  const style = name.match(STYLE_RE)?.groups?.style || 'normal'
  const subset = name.match(SUBSET_RE)?.groups?.subset || 'latin'

  for (const slug of [range?.[0], weight, style, subset]) {
    if (slug) {
      name = name.replace(slug, '')
    }
  }

  const weightKeys = range
    ? variableWeightKeys(Number(range.groups!.min), Number(range.groups!.max))
    : VARIABLE_RE.test(name)
      ? variableWeightKeys(100, 900)
      : [weightMap[weight!] || weight!]

  const slugs = new Set<string>()

  for (const slug of [name.replace(/\.\w*$/, ''), name.replace(/[._-]\w*$/, '')]) {
    for (const weightKey of weightKeys) {
      slugs.add([
        fontFamilyToSlug(slug.replace(/[\W_]+$/, '')),
        weightKey,
        style,
        subset,
      ].join('-').toLowerCase())
    }
  }

  return [...slugs]
}

function fontFamilyToSlug(family: string) {
  return family.toLowerCase().replace(NON_WORD_RE, '')
}

function normaliseWeight(weight: string | number) {
  const range = matchWeightRange(String(weight))
  if (range) {
    return `${range.groups!.min}-${range.groups!.max}`
  }
  return weightMap[weight] || weight
}
