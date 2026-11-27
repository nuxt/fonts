import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { dirname, join } from 'pathe'

import type { ResolvedFontDetails } from '../src/types.ts'
import { buildAssets } from './build-assets.ts'

const rootDir = fileURLToPath(new URL('./fixtures/nuxt5-vite-server', import.meta.url))

function referencedFonts(output: Map<string, string>) {
  const files = new Set<string>()
  for (const [file, contents] of output) {
    if (!file.endsWith('.html') && !file.endsWith('.css')) {
      continue
    }
    const urls = [
      ...Array.from(contents.matchAll(/<link[^>]+as="font"[^>]+href="([^"]+)"/g), m => m[1]!),
      ...Array.from(contents.matchAll(/url\((['"]?)([^'")]+\.woff2)\1\)/g), m => m[2]!),
    ]
    for (const url of urls) {
      files.add(url.startsWith('/') ? url.slice(1) : join(dirname(file), url))
    }
  }
  return [...files].sort()
}

async function build(overrides: Parameters<typeof buildAssets>[1] = {}) {
  const warnings: string[] = []
  const spies = [
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
      warnings.push(String(chunk))
      return true
    }),
    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      warnings.push(args.join(' '))
    }),
  ]
  try {
    return { output: await buildAssets(rootDir, overrides, '**/*.{css,html,woff2}'), warnings: warnings.join('\n') }
  }
  finally {
    for (const spy of spies) {
      spy.mockRestore()
    }
  }
}

describe('nuxt 5 with the vite server builder', () => {
  let output: Map<string, string>
  let warnings: string
  const resolved: ResolvedFontDetails[] = []
  beforeAll(async () => {
    ({ output, warnings } = await build({ hooks: { 'fonts:resolved': font => void resolved.push(font) } }))
  }, 120_000)

  it('writes the font files the build references into the output', () => {
    const fonts = referencedFonts(output)

    expect(fonts.filter(file => file.startsWith('_nuxt/fonts/'))).toHaveLength(4)
    expect(fonts.filter(file => !output.get(file)?.startsWith('wOF2'))).toEqual([])
  })

  it('resolves fonts from the public directory', () => {
    expect(referencedFonts(output)).toContain('fonts/MyLocal-400.woff2')
    expect(resolved.find(font => font.fontFamily === 'MyLocal')?.files.map(file => file.url)).toEqual(['/fonts/MyLocal-400.woff2'])
  })

  it('registers no server plugins the server cannot run', () => {
    expect(warnings).not.toContain('NUXT_B8024')
  })

  it('warns that font preloads in route rules are ignored', async () => {
    const { warnings } = await build({ routeRules: { '/': { fonts: { preload: { Abel: { weights: [400] } } } } } })

    expect(warnings).toContain('Font preloads in route rules need a Nitro server')
    expect(warnings).not.toContain('NUXT_B8024')
  }, 120_000)

  it('does not retry a failed download for every emitted font file', async () => {
    const url = 'https://fonts.invalid/Broken-400.woff2'
    const attemptsPerDownload = 4
    let attempts = 0
    const fetch = globalThis.fetch
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if ((input instanceof Request ? input.url : String(input)) === url) {
        attempts++
        return Promise.reject(new TypeError('fetch failed'))
      }
      return fetch(input, init)
    })
    try {
      const { output } = await build({ fonts: { throwOnError: false, families: [{ name: 'Broken', src: url, global: true }] } })
      const fonts = referencedFonts(output).filter(file => file.startsWith('_nuxt/fonts/'))

      expect(attempts).toBeGreaterThan(0)
      expect(attempts).toBeLessThan(attemptsPerDownload * fonts.length)
    }
    finally {
      spy.mockRestore()
    }
  }, 120_000)
})
