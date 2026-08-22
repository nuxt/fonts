import type { ConsolaInstance } from 'consola'

const LOCAL_PROVIDER_MISSING_FONT_RE = /^Could not produce font face declaration from `?local`? for font family `?(.+?)`?\.$/
const LOCAL_FONT_EXTENSIONS = ['woff2', 'woff', 'ttf', 'otf', 'eot']

/** Append an expected local-font filename to matching resolver warnings. */
export function withLocalProviderMissingFontHint(message: string) {
  const match = message.match(LOCAL_PROVIDER_MISSING_FONT_RE)
  if (!match) {
    return message
  }

  const fileStem = fontFamilyToFileStem(match[1]!)
  if (!fileStem) {
    return message
  }

  return `${message} Expected a file like \`${fileStem}.[${LOCAL_FONT_EXTENSIONS.join('|')}]\` in a configured public asset directory or local provider dir.`
}

/** Return a logger that enriches local-provider missing-font warnings. */
export function withLocalProviderHintLogger(logger: ConsolaInstance): ConsolaInstance {
  return Object.assign(Object.create(logger), {
    /** Forward warnings after enhancing matching string messages. */
    warn(message: unknown, ...args: unknown[]) {
      return logger.warn(typeof message === 'string' ? withLocalProviderMissingFontHint(message) : message, ...args)
    },
  }) as ConsolaInstance
}

/** Convert a font-family name into the filename stem used by local font assets. */
function fontFamilyToFileStem(family: string) {
  return family
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
