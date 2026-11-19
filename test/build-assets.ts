import { promises as fsp } from 'node:fs'
import { expect } from 'vitest'
import { buildNuxt, loadNuxt } from '@nuxt/kit'
import type { NuxtConfig } from '@nuxt/schema'
import { defu } from 'defu'
import { join } from 'pathe'
import { glob } from 'tinyglobby'

export async function buildAssets(rootDir: string, overrides: NuxtConfig = {}) {
  const buildDir = join(rootDir, '.nuxt', 'test', Math.random().toString(36).slice(2, 8))
  const nuxt = await loadNuxt({
    cwd: rootDir,
    dev: false,
    overrides: defu(overrides, { buildDir, nitro: { output: { dir: join(buildDir, 'output') } } }),
  })
  try {
    await buildNuxt(nuxt)
    const publicDir = join(buildDir, 'output', 'public')
    const files = await glob('_nuxt/*.{css,js}', { cwd: publicDir })
    return new Map(await Promise.all(files.map(async file => [file, await fsp.readFile(join(publicDir, file), 'utf8')] as const)))
  }
  finally {
    await nuxt.close()
    await fsp.rm(buildDir, { recursive: true, force: true })
  }
}

export function findStylesheet(assets: Map<string, string>, name: string) {
  const file = [...assets.keys()].find(file => file.startsWith(`_nuxt/${name}.`) && file.endsWith('.css'))
  expect(file).toBeDefined()
  return assets.get(file!)!
}

export function sharedNamesWithDifferentContents(a: Map<string, string>, b: Map<string, string>) {
  return [...a].filter(([file, contents]) => b.has(file) && b.get(file) !== contents).map(([file]) => file)
}

export function referencedStylesheets(assets: Map<string, string>) {
  return [...assets]
    .filter(([file]) => file.endsWith('.js'))
    .flatMap(([, contents]) => Array.from(contents.matchAll(/(?<=["'`](?:\.\/|\/_nuxt\/)?)[\w-]+\.[\w-]{8}\.css(?=["'`])/g), m => `_nuxt/${m[0]}`))
}
