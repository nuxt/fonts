import { promises as fsp } from 'node:fs'

export async function setup () {
  await fsp.rm('./node_modules/.cache/nuxt/fonts', { recursive: true, force: true })
  await fsp.rm('./playground/node_modules/.cache/nuxt/fonts', { recursive: true, force: true })
  console.log('✅ Cleared font cache.')
}
