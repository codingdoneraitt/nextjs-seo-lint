import fs from 'node:fs'
import path from 'node:path'
import { walk } from '../utils/ast'
import { findAppDir, findProjectRoot, hasDynamicRoutes } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checked = false

export const noMissingErrorBoundaryMetadata = createRule(
  'no-missing-error-boundary-metadata',
  'require noindexed error boundaries for dynamic App Router apps',
  (context) => ({
    'Program:exit'(program) {
      const root = findProjectRoot(process.cwd())
      const appDir = findAppDir(root)
      if (!checked) {
        checked = true
        if (appDir && hasDynamicRoutes(root)) {
          const hasError = ['error.tsx', 'error.ts', 'error.jsx', 'error.js'].some((name) =>
            fs.existsSync(path.join(appDir, name)),
          )
          if (!hasError) report(context, program, 'Dynamic routes detected but app/error.tsx is missing.')
        }
        if (
          appDir &&
          !['global-error.tsx', 'global-error.ts', 'global-error.jsx', 'global-error.js'].some((name) =>
            fs.existsSync(path.join(appDir, name)),
          )
        ) {
          report(context, program, 'app/global-error.tsx is missing; root layout crashes are unhandled.')
        }
      }

      if (!/\/(?:global-)?error\.[cm]?[jt]sx?$/.test(context.getFilename().replaceAll('\\', '/'))) return
      let hasHomeLink = false
      walk(program as never, (node) => {
        if (node.type !== 'JSXOpeningElement') return
        const attrs = (node.attributes as any[] | undefined) ?? []
        if (
          attrs.some(
            (attr) => attr.type === 'JSXAttribute' && attr.name?.name === 'href' && attr.value?.value === '/',
          )
        )
          hasHomeLink = true
      })
      if (!hasHomeLink) report(context, program, 'Error boundary should link back to the homepage.')
    },
  }),
  'suggestion',
)
