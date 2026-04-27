import { promises as fsp } from 'node:fs'
import { fileURLToPath } from 'node:url'

const fixtureDir = fileURLToPath(new URL('.', import.meta.url))

async function readFixture(name: string) {
  return fsp.readFile(`${fixtureDir}/${name}`, 'utf8')
}

/** Replace adobe HTTP calls with shape-only stubs so the suite doesn't depend on `typekit.com`. */
export function mockAdobeFetch() {
  const realFetch = globalThis.fetch
  globalThis.fetch = async function mockedFetch(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const kitMeta = url.match(/^https:\/\/typekit\.com\/api\/v1\/json\/kits\/([^/]+)\/published/)
    if (kitMeta) {
      const body = await readFixture(`kit-${kitMeta[1]}.json`)
      return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const kitCss = url.match(/^https:\/\/use\.typekit\.net\/([^/]+)\.css/)
    if (kitCss) {
      const body = await readFixture(`${kitCss[1]}.css`)
      return new Response(body, { status: 200, headers: { 'content-type': 'text/css' } })
    }
    if (/^https:\/\/use\.typekit\.net\/stub\//.test(url)) {
      return new Response(new Uint8Array(), { status: 200, headers: { 'content-type': 'font/woff2' } })
    }
    return realFetch(input as RequestInfo, init)
  } as typeof fetch
}
