import fsp from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'
import { dirname, join } from 'pathe'
import { createUnifont, providers } from 'unifont'

import { createNpmProviderOptions } from '../../src/providers/npm'

const fixturePath = fileURLToPath(new URL('../../node_modules/.cache/test/npm-fixtures', import.meta.url))

describe('npm font provider options', () => {
  it('should resolve font packages hoisted above the project root', async () => {
    const root = join(fixturePath, 'hoisted/packages/app')
    await createFixture('hoisted', {
      'packages/app/package.json': JSON.stringify({ dependencies: { 'cal-sans': '1.0.1' } }),
      'node_modules/cal-sans/package.json': JSON.stringify({ name: 'cal-sans', version: '1.0.1', main: 'index.css' }),
      'node_modules/cal-sans/index.css': FIXTURE_CSS,
      'node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2': '',
    })

    const unifont = await createUnifont([providers.npm({ ...createNpmProviderOptions(root), remote: false })])
    const { fonts } = await unifont.resolveFont('Cal Sans', { weights: ['600'], styles: ['normal'], subsets: ['latin'], formats: ['woff2'] })

    expect(fonts.flatMap(font => font.src.map(src => 'url' in src ? src.url : src))).toEqual([
      pathToFileURL(join(fixturePath, 'hoisted/node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2')).href,
    ])
  })

  it('should report the properties a locally installed package publishes', async () => {
    const root = join(fixturePath, 'properties')
    await createFixture('properties', {
      'package.json': JSON.stringify({ dependencies: { 'cal-sans': '1.0.1' } }),
      'node_modules/cal-sans/package.json': JSON.stringify({ name: 'cal-sans', version: '1.0.1', main: 'index.css' }),
      'node_modules/cal-sans/index.css': FIXTURE_CSS,
      'node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2': '',
    })

    const unifont = await createUnifont([providers.npm({ ...createNpmProviderOptions(root), remote: false })])

    expect(await unifont.getFontProperties('Cal Sans')).toEqual({
      provider: 'npm',
      styles: ['normal'],
      weights: ['600'],
    })
  })

  it('should resolve a stylesheet that the package `exports` map does not expose', async () => {
    const root = join(fixturePath, 'unexported/packages/app')
    await createFixture('unexported', {
      'packages/app/package.json': JSON.stringify({ dependencies: { 'cal-sans': '1.0.1' } }),
      'node_modules/cal-sans/package.json': JSON.stringify({
        name: 'cal-sans',
        version: '1.0.1',
        exports: { '.': './noop.js' },
      }),
      'node_modules/cal-sans/index.css': FIXTURE_CSS,
      'node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2': '',
    })

    const unifont = await createUnifont([providers.npm({ ...createNpmProviderOptions(root), remote: false })])
    const { fonts } = await unifont.resolveFont('Cal Sans', { weights: ['600'], styles: ['normal'], subsets: ['latin'], formats: ['woff2'] })

    expect(fonts.flatMap(font => font.src.map(src => 'url' in src ? src.url : src))).toEqual([
      pathToFileURL(join(fixturePath, 'unexported/node_modules/cal-sans/fonts/webfonts/CalSans-SemiBold.woff2')).href,
    ])
  })

  it('should not resolve a package that ships no stylesheet', async () => {
    const root = join(fixturePath, 'no-css')
    await createFixture('no-css', {
      'package.json': JSON.stringify({ dependencies: { geist: '1.7.2' } }),
      'node_modules/geist/package.json': JSON.stringify({
        name: 'geist',
        version: '1.7.2',
        exports: { './font': { default: './dist/font.js' } },
      }),
      'node_modules/geist/dist/fonts/geist-sans/Geist-Bold.woff2': '',
    })

    const unifont = await createUnifont([providers.npm({ ...createNpmProviderOptions(root), remote: false })])
    const { fonts } = await unifont.resolveFont('Geist', { weights: ['700'], styles: ['normal'], subsets: ['latin'], formats: ['woff2'] })

    expect(fonts).toEqual([])
  })
})

const FIXTURE_CSS = `@font-face {
  font-family: "Cal Sans";
  font-style: normal;
  font-weight: 600;
  src: url("./fonts/webfonts/CalSans-SemiBold.woff2") format("woff2");
}`

async function createFixture(slug: string, files: Record<string, string>) {
  await fsp.rm(join(fixturePath, slug), { recursive: true, force: true })
  for (const [file, contents] of Object.entries(files)) {
    const path = join(fixturePath, slug, file)
    await fsp.mkdir(dirname(path), { recursive: true })
    await fsp.writeFile(path, contents)
  }
}
