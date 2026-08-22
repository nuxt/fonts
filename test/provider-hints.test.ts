import { describe, expect, it, vi } from 'vitest'

import { withLocalProviderHintLogger, withLocalProviderMissingFontHint } from '../src/provider-hints'

describe('provider hints', () => {
  it('adds an expected file hint to local provider missing-font warnings', () => {
    expect(withLocalProviderMissingFontHint('Could not produce font face declaration from `local` for font family `Faro Variable`.'))
      .toBe('Could not produce font face declaration from `local` for font family `Faro Variable`. Expected a file like `faro-variable.[woff2|woff|ttf|otf|eot]` in a configured public asset directory or local provider dir.')
  })

  it('leaves unrelated warnings unchanged', () => {
    expect(withLocalProviderMissingFontHint('Unknown provider `other` for font family `Faro Variable`. Falling back to default providers.'))
      .toBe('Unknown provider `other` for font family `Faro Variable`. Falling back to default providers.')
  })

  it('wraps logger warnings without changing non-string arguments', () => {
    const warn = vi.fn()
    const logger = withLocalProviderHintLogger({ warn } as any)
    const error = new Error('failure')

    logger.warn('Could not produce font face declaration from `local` for font family `Faro Variable`.', error)
    logger.warn(error)

    expect(warn).toHaveBeenNthCalledWith(1, 'Could not produce font face declaration from `local` for font family `Faro Variable`. Expected a file like `faro-variable.[woff2|woff|ttf|otf|eot]` in a configured public asset directory or local provider dir.', error)
    expect(warn).toHaveBeenNthCalledWith(2, error)
  })
})
