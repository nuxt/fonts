import { hash } from 'ohash'

import type { FontProvider } from '../types'
import { extractFontFaceData, addLocalFallbacks } from '../css/parse'
import { cachedData } from '../cache'
import { $fetch } from '../fetch'
import { logger } from '../logger'

export default {
  async setup() {
    await initialiseFontMeta()
  },
  async resolveFontFaces(fontFamily, defaults) {
    if (!isGoogleIcon(fontFamily)) {
      return
    }

    return {
      fonts: await cachedData(`googleicons:${fontFamily}-${hash(defaults)}-data.json`, () => getFontDetails(fontFamily), {
        onError(err) {
          logger.error(`Could not fetch metadata for \`${fontFamily}\` from \`googleicons\`.`, err)
          return []
        },
      }),
    }
  },
} satisfies FontProvider

/** internal */

let fonts: string[]

async function fetchFontMetadata() {
  const response: { families: string[] } = JSON.parse((await $fetch<string>(
    'https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true',
  )).split('\n').slice(1).join('\n')) // remove the first line which makes it an invalid JSON

  return response.families
}

async function initialiseFontMeta() {
  fonts = await cachedData('googleicons:meta.json', fetchFontMetadata, {
    onError() {
      logger.error('Could not download `googleicons` font metadata. `@nuxt/fonts` will not be able to inject `@font-face` rules for googleicons.')
      return []
    },
  })
}

function isGoogleIcon(family: string) {
  return fonts.includes(family)
}

async function getFontDetails(family: string) {
  let css = ''

  if (family.includes('Icons')) {
    css += await $fetch<string>('/css2', {
      baseURL: 'https://fonts.googleapis.com/icon',
      query: {
        family: family,
      },
    })
  }

  for (const extension in userAgents) {
    // Legacy Material Icons
    if (family.includes('Icons')) {
      css += await $fetch<string>('/icon', {
        baseURL: 'https://fonts.googleapis.com',
        headers: { 'user-agent': userAgents[extension as keyof typeof userAgents] },
        query: {
          family: family,
        },
      })
    }
    // New Material Symbols
    else {
      css += await $fetch<string>('/css2', {
        baseURL: 'https://fonts.googleapis.com',
        headers: { 'user-agent': userAgents[extension as keyof typeof userAgents] },
        query: {
          family: family + ':' + 'opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        },
      })
    }
  }

  return addLocalFallbacks(family, extractFontFaceData(css))
}

const userAgents = {
  woff2: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  ttf: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.54.16 (KHTML, like Gecko) Version/5.1.4 Safari/534.54.16',
  // eot: 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
  // woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
  // svg: 'Mozilla/4.0 (iPad; CPU OS 4_0_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/4.1 Mobile/9A405 Safari/7534.48.3',
}
