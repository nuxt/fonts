import { access, readFile } from 'node:fs/promises'

import { resolveModulePath } from 'exsolve'
import { join } from 'pathe'
import { withTrailingSlash } from 'ufo'
import type { NpmProviderOptions } from 'unifont'

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
    resolve: id => resolveModulePath(id, {
      from: withTrailingSlash(rootDir),
      conditions: ['node', 'import', 'style', 'default'],
      try: true,
    }) ?? join(rootDir, 'node_modules', id),
  }
}
