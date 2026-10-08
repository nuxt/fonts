/** `subset-font` ships no type declarations of its own. */
export type SubsetFont = (
  font: Buffer,
  text: string,
  options?: { targetFormat?: 'sfnt' | 'woff' | 'woff2', variationAxes?: Record<string, number | { min?: number, max?: number }>, preserveNameIds?: number[] },
) => Promise<Buffer>
