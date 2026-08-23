import { access, readFile } from 'node:fs/promises'

import { resolveModulePath } from 'exsolve'
import { join } from 'pathe'
import { withTrailingSlash } from 'ufo'
import type { NpmProviderOptions } from 'unifont'

import { resolvePackageFile } from './resolve'

/**
 * Filesystem access for `unifont`'s `npm` provider, so font packages installed in the
 * project are resolved from disk rather than fetched from a CDN.
 */
export function createNpmProviderOptions(rootDir: string): NpmProviderOptions {
  return {
    root: rootDir,
    readFile: path => readFile(path, 'utf-8').catch(() => null),
    exists: path => access(path).then(() => true, () => false),
    // pnpm's isolated store, hoisting to a monorepo root and Yarn PnP all place packages
    // outside `<rootDir>/node_modules`, which is the only location the provider can guess.
    // A package whose `exports` do not expose its stylesheet is not resolvable at all, so we
    // fall back to locating the package directory on disk.
    resolve: id => resolveModulePath(id, {
      from: withTrailingSlash(rootDir),
      conditions: ['node', 'import', 'style', 'default'],
      try: true,
    }) ?? resolvePackageFile(id, rootDir) ?? join(rootDir, 'node_modules', id),
  }
}
