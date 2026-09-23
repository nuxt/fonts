import { pathToFileURL } from 'node:url'

import { resolveModulePath } from 'exsolve'
import type { RenderedFont } from 'fontless'
import { isCI, isTest } from 'std-env'

import { logger } from './logger'

const packageName = 'subset-font'

/**
 * Resolve `subset-font` from the user's project first, so that it is picked up however
 * their package manager lays out `node_modules`, and only then from our own dependencies.
 */
function resolveSubsetter(rootDir: string) {
  return resolveModulePath(packageName, {
    from: [pathToFileURL(rootDir + '/'), import.meta.url],
    try: true,
  })
}

/** How to add `subset-font`, phrased for the package manager the project actually uses. */
async function installInstructions(rootDir: string) {
  const { addDependencyCommand, detectPackageManager } = await import('nypm')
  const packageManager = await detectPackageManager(rootDir).catch(() => undefined)
  const command = addDependencyCommand(packageManager?.name || 'npm', packageName, { dev: true })
  return `Install it with \`${command}\`, or remove the \`glyphs\` and \`variableAxis\` options.`
}

/**
 * Make sure `subset-font` is available before a build that may need it, offering to
 * install it.
 *
 * It is an optional peer dependency rather than a dependency because the harfbuzz wasm it
 * loads is several megabytes, and only projects that subset a font need it. A project whose
 * providers subset every family server-side never needs it, so where we cannot ask (CI, a
 * non-interactive terminal) we warn rather than fail.
 */
export async function ensureSubsetter(rootDir: string) {
  if (resolveSubsetter(rootDir)) {
    return true
  }

  const install = await installInstructions(rootDir)

  if (isCI || isTest || !process.stdout.isTTY) {
    logger.warn(`\`fonts.glyphs\` or \`fonts.variableAxis\` is set, which needs the \`${packageName}\` package to subset fonts that the provider cannot subset for us. The build will fail before downloading any font that needs it. ${install}`)
    return false
  }

  const confirmed = await logger.prompt(`\`fonts.glyphs\` or \`fonts.variableAxis\` is set, which needs the \`${packageName}\` package. Install it?`, {
    type: 'confirm',
    initial: true,
  })

  if (confirmed !== true) {
    logger.info(install)
    return false
  }

  try {
    const { addDependency } = await import('nypm')
    await addDependency(packageName, { cwd: rootDir, dev: true })
    logger.success(`Installed \`${packageName}\`.`)
    return true
  }
  catch (cause) {
    logger.error(new Error(`Could not install \`${packageName}\`. ${install}`, { cause }))
    return false
  }
}

/** Stop a build before it downloads fonts it would not be able to subset. */
export async function assertSubsetter(rootDir: string, urls: string[]) {
  if (resolveSubsetter(rootDir)) {
    return
  }

  throw new Error(`Subsetting \`${urls.join('`, `')}\` requires the \`${packageName}\` package, as their provider cannot subset them for us. ${await installInstructions(rootDir)}`)
}

let subsetter: Promise<typeof import('subset-font').default> | undefined

/**
 * `subset-font` is an optional peer dependency, and the harfbuzz wasm it loads is several
 * megabytes, so it is resolved lazily and only by projects that subset a font.
 */
function loadSubsetter(rootDir: string) {
  const path = resolveSubsetter(rootDir)
  subsetter ??= import(path ? pathToFileURL(path).href : packageName).then(module => module.default, async (cause) => {
    subsetter = undefined
    throw new Error(`Subsetting fonts requires the \`${packageName}\` package. ${await installInstructions(rootDir)}`, { cause })
  })
  return subsetter
}

/**
 * Reduce `font` to the glyphs needed to render `text`, keeping its original format, and
 * apply `variationAxes` to its variation space.
 *
 * Throws if `subset-font` is not installed: a project that asked for a subset should not
 * silently be given a full font. Fonts harfbuzz cannot process are passed through with a
 * warning instead, as not every format can be subsetted.
 */
export async function subsetFont(font: Buffer, text: string, url: string, rootDir: string, variationAxes?: RenderedFont['variationAxes']): Promise<Buffer> {
  const subset = await loadSubsetter(rootDir)
  const axes = variationAxes && Object.keys(variationAxes).length > 0 ? variationAxes : undefined
  if (axes) {
    try {
      return await subset(font, text, { variationAxes: axes })
    }
    catch (cause) {
      // An axis the font does not have fails the whole subset, glyphs included.
      logger.warn(`Could not apply variable font axes \`${Object.keys(axes).join('`, `')}\` to \`${url}\`. Emitting the font with its axes unchanged.`, cause)
    }
  }
  try {
    return await subset(font, text)
  }
  catch (cause) {
    logger.warn(`Could not subset font \`${url}\`. Falling back to the original font file.`, cause)
    return font
  }
}
