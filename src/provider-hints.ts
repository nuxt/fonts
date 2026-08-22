import type { ConsolaInstance } from 'consola'

const LOCAL_PROVIDER_MISSING_FONT_RE = /^Could not produce font face declaration from `?local`? for font family `?(.+?)`?\.$/
const LOCAL_FONT_EXTENSIONS = ['woff2', 'woff', 'ttf', 'otf', 'eot']

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

export function withLocalProviderHintLogger(logger: ConsolaInstance): ConsolaInstance {
  return Object.assign(Object.create(logger), {
    warn(message: unknown, ...args: unknown[]) {
      return logger.warn(typeof message === 'string' ? withLocalProviderMissingFontHint(message) : message, ...args)
    },
  }) as ConsolaInstance
}

function fontFamilyToFileStem(family: string) {
  return family
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
