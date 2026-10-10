import { logger } from './logger.ts'

let minifier: Promise<typeof import('lightningcss').transform | undefined> | undefined

/**
 * Minify generated CSS with `lightningcss`, an optional peer dependency. The CSS is
 * returned unchanged when it is not installed.
 */
export async function minifyCSS(css: string, filename: string) {
  minifier ??= import('lightningcss').then(module => module.transform, () => undefined)
  const transform = await minifier
  if (!transform) {
    return css
  }
  try {
    return transform({ filename, code: Buffer.from(css), minify: true }).code.toString()
  }
  catch (error) {
    logger.warn(`Could not minify generated \`@font-face\` rules in \`${filename}\`.`, error)
    return css
  }
}
