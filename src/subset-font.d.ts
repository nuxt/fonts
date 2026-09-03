/** `subset-font` ships no type declarations of its own. */
declare module 'subset-font' {
  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: { targetFormat?: 'sfnt' | 'woff' | 'woff2', variationAxes?: Record<string, { min?: number, max?: number }>, preserveNameIds?: number[] },
  ): Promise<Buffer>
}
