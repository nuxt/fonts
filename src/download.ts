import { $fetch } from 'ofetch'
import { logger } from './logger'

export interface DownloadFontOptions {
  /** @default 3 */
  retries?: number
  /** @default 500 */
  retryDelay?: number
}

/**
 * Download a font file, retrying transient upstream failures with exponential backoff.
 *
 * Every failure is retried, including `404`s: Google's CSS edges hand out `woff2` URLs
 * that the file edges have not caught up with yet (nuxt/fonts#864), so a `404` here is
 * not reliably deterministic.
 *
 * `ofetch` retries eligible `GET` failures once by default, with no delay, which would
 * both double the request count and bypass the backoff below.
 */
export async function downloadFont(url: string, options: DownloadFontOptions = {}): Promise<Buffer> {
  const retries = options.retries ?? 3
  const retryDelay = options.retryDelay ?? 500

  for (let attempt = 0; ; attempt++) {
    try {
      return Buffer.from(await $fetch(url, { responseType: 'arrayBuffer', retry: false }))
    }
    catch (cause) {
      if (attempt >= retries) {
        throw new Error(`Could not download font from \`${url}\` after ${retries + 1} attempts.`, { cause })
      }
      const delay = retryDelay * 2 ** attempt
      logger.warn(`Could not download font from \`${url}\`. Will retry in \`${delay}ms\`. \`${retries - attempt}\` retries left.`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
