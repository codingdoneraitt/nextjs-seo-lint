import fs from 'node:fs'
import path from 'node:path'
import {
  getObjectProperty,
  getPathProperty,
  getStaticString,
  metadataSources,
  sourceHasNoindex,
  walk,
} from '../utils/ast'
import { findAppDir, findProjectRoot, isPageFile, routeIsPrivate } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checkedRobots = false

export const noAccidentalNoindex = createRule(
  'no-accidental-noindex',
  'prevent public pages and robots files from disabling indexing',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      const options = (context.options[0] ?? {}) as { privateRoutes?: string[] }
      const privateRoutes = options.privateRoutes

      if (isPageFile(filename) && !routeIsPrivate(filename, privateRoutes)) {
        const sources = metadataSources(program as never)
        if (sources.length <= 1 || sources.every(sourceHasNoindex)) {
          for (const source of sources) {
            const robots = getPathProperty(source, ['robots'])
            if (!robots) continue
            if (getStaticString(robots.value)?.toLowerCase().includes('noindex')) {
              report(
                context,
                robots.node as never,
                'Public page sets robots: "noindex"; this can remove the page from search indexes.',
              )
            }
            const index = getObjectProperty(robots.value, 'index')
            if (index?.value.type === 'Literal' && index.value.value === false) {
              report(context, index.node as never, 'Public page sets robots.index to false.')
            }
          }
        }
      }

      walk(program as never, (node) => {
        if (node.type !== 'ConditionalExpression' && node.type !== 'LogicalExpression') return
        const text = context.sourceCode.getText(node as never)
        if (/NODE_ENV/.test(text) && /noindex/.test(text) && /production/.test(text)) {
          report(
            context,
            node as never,
            'Environment-gated noindex logic should be reviewed; production pages must not emit noindex.',
          )
        }
      })

      if (checkedRobots) return
      checkedRobots = true
      const root = findProjectRoot(process.cwd())
      const appDir = findAppDir(root)
      const robotsTs = appDir
        ? ['robots.ts', 'robots.js'].map((name) => path.join(appDir, name)).find(fs.existsSync)
        : undefined
      if (robotsTs) {
        const text = fs.readFileSync(robotsTs, 'utf8')
        if (/disallow\s*:\s*['"`]\/['"`]/i.test(text) && !/allow\s*:\s*['"`]\/['"`]/i.test(text)) {
          report(context, program, `${robotsTs} appears to disallow "/" without an allow rule.`)
        }
      }
      const publicRobots = path.join(root, 'public', 'robots.txt')
      if (fs.existsSync(publicRobots)) {
        const text = fs.readFileSync(publicRobots, 'utf8')
        if (/^\s*Disallow:\s*\/\s*$/im.test(text) && !/^\s*Allow:\s*\/.+/im.test(text)) {
          report(context, program, 'public/robots.txt disallows all crawling with "Disallow: /".')
        }
      }
      const nextConfig = ['next.config.js', 'next.config.mjs', 'next.config.ts']
        .map((name) => path.join(root, name))
        .find(fs.existsSync)
      if (nextConfig) {
        const text = fs.readFileSync(nextConfig, 'utf8')
        if (/X-Robots-Tag/i.test(text) && /noindex/i.test(text) && !onlyNoindexesMetadataAssets(text)) {
          report(
            context,
            program,
            'next.config sets X-Robots-Tag: noindex; verify this is not applied to public routes.',
          )
        }
      }
    },
  }),
)

function onlyNoindexesMetadataAssets(text: string): boolean {
  const sources: string[] = []
  let currentSource: string | undefined
  for (const line of text.split(/\r?\n/)) {
    const source = line.match(/source\s*:\s*['"`]([^'"`]+)['"`]/)
    if (source) currentSource = source[1]
    if (/X-Robots-Tag/i.test(line) && /noindex/i.test(line) && currentSource) sources.push(currentSource)
  }
  return (
    sources.length > 0 &&
    sources.every((source) =>
      /(^|\/|:)twitter-image|(^|\/|:)opengraph-image|(^|\/|:)icon|favicon|apple-icon/i.test(source),
    )
  )
}
