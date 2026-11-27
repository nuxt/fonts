import { existsSync } from 'node:fs'
import { getLayerDirectories, resolveServerVariant } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

interface PublicAssetDir {
  dir: string
  baseURL?: string
}

/** Whether Nitro builds the server, running Nitro plugins and copying `nitro.publicAssets` into the output. */
export function hasNitroServer() {
  return !!resolveServerVariant({ nitro2: true, nitro3: true, nuxt: false })
}

/** Call `callback` with the directories served as public assets, before the app is built. */
export function onPublicAssetDirs(nuxt: Nuxt, callback: (dirs: PublicAssetDir[]) => void | Promise<void>) {
  let nitroInitialised = false
  nuxt.hook('nitro:init', (nitro) => {
    nitroInitialised = true
    return callback(nitro.options.publicAssets)
  })
  nuxt.hook('ready', () => {
    if (!nitroInitialised) {
      return callback(getLayerDirectories(nuxt).map(dirs => ({ dir: dirs.public })).filter(({ dir }) => existsSync(dir)))
    }
  })
}
