import { existsSync } from 'node:fs'

import { dirname, join } from 'pathe'

const SCOPED_RE = /^(@[^/]+\/[^/]+)(?:\/(.*))?$/
const UNSCOPED_RE = /^([^/]+)(?:\/(.*))?$/

/**
 * Locate an installed package without importing it, so packages that do not export their
 * `package.json` (or have no main entry at all) can still be found. Walks up from `rootDir`,
 * as workspaces commonly hoist packages to a `node_modules` above the project.
 */
export function resolvePackageDir(name: string, rootDir: string) {
  let dir = rootDir
  while (true) {
    const candidate = join(dir, 'node_modules', name)
    if (existsSync(candidate)) {
      return candidate
    }
    const parent = dirname(dir)
    if (parent === dir) {
      return
    }
    dir = parent
  }
}

/**
 * Resolve a package-relative specifier (such as `@fontsource/roboto/index.css`) by locating
 * the package directory on disk, for packages whose `exports` do not expose the file.
 */
export function resolvePackageFile(id: string, rootDir: string) {
  const [, name, subpath] = id.match(SCOPED_RE) || id.match(UNSCOPED_RE) || []
  const dir = name && resolvePackageDir(name, rootDir)
  if (!dir) {
    return
  }
  return subpath ? join(dir, subpath) : dir
}
