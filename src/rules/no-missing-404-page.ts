import fs from 'node:fs'
import path from 'node:path'
import { getPathProperty, getStaticString, metadataSources, walk } from '../utils/ast'
import { findAppDir, findProjectRoot } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checked = false

export const noMissing404Page = createRule(
  'no-missing-404-page',
  'require a custom noindexed App Router 404 page',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()

      if (!checked) {
        checked = true
        const appDir = findAppDir(findProjectRoot(process.cwd()))
        const hasNotFound = appDir
          ? ['not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js'].some((name) =>
              fs.existsSync(path.join(appDir, name)),
            )
          : false
        if (!hasNotFound) {
          report(
            context,
            program,
            'Missing app/not-found.tsx; custom 404 pages should set metadata and provide a recovery path.',
          )
        }
      }

      if (!/\/not-found\.[cm]?[jt]sx?$/.test(filename.split(path.sep).join('/'))) return

      const sources = metadataSources(program as never)
      const title = sources.map((source) => getPathProperty(source, ['title'])).find(Boolean)
      if (!title || getStaticString(title.value)?.trim() === '') {
        report(context, program, 'not-found.tsx should export metadata.title.')
      }
      const robots = sources.map((source) => getPathProperty(source, ['robots'])).find(Boolean)
      const robotsText = robots ? context.sourceCode.getText(robots.value as never) : ''
      if (!/noindex|index\s*:\s*false/.test(robotsText)) {
        report(context, program, 'not-found.tsx should set robots noindex.')
      }

      let hasHomeLink = false
      walk(program as never, (node) => {
        if (node.type !== 'JSXOpeningElement') return
        const attrs = (node.attributes as any[] | undefined) ?? []
        if (
          attrs.some(
            (attr) => attr.type === 'JSXAttribute' && attr.name?.name === 'href' && attr.value?.value === '/',
          )
        ) {
          hasHomeLink = true
        }
      })
      if (!hasHomeLink) report(context, program, 'not-found.tsx should link back to the homepage.')
    },
  }),
  'suggestion',
)
