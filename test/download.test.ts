import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.hoisted(() => vi.fn())

vi.mock('ofetch', () => ({ $fetch: fetchMock }))
vi.mock('../src/logger', () => ({ logger: { warn: vi.fn() } }))

const { downloadFont } = await import('../src/download')

describe('downloadFont', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('should return the font body on first success', async () => {
    fetchMock.mockResolvedValueOnce(new TextEncoder().encode('font').buffer)

    const res = await downloadFont('https://fonts.example/font.woff2', { retryDelay: 0 })

    expect(res.toString()).toBe('font')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('should retry a transient 404 from the font CDN', async () => {
    fetchMock
      .mockRejectedValueOnce(Object.assign(new Error('404 Not Found'), { status: 404 }))
      .mockResolvedValueOnce(new TextEncoder().encode('font').buffer)

    const res = await downloadFont('https://fonts.example/font.woff2', { retryDelay: 0 })

    expect(res.toString()).toBe('font')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('should throw an actionable error once retries are exhausted', async () => {
    fetchMock.mockRejectedValue(new Error('fetch failed'))

    await expect(downloadFont('https://fonts.example/font.woff2', { retries: 2, retryDelay: 0 }))
      .rejects.toThrowError('Could not download font from `https://fonts.example/font.woff2` after 3 attempts.')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
