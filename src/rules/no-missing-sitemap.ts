import fs from 'node:fs'
import path from 'node:path'
import { findAppDir, findProjectRoot } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checked = false

export const noMissingSitemap = createRule(
  'no-missing-sitemap',
  'require a Next.js sitemap and robots sitemap reference',
  (context) => ({
    'Program:exit'(program) {
      if (checked) return
      checked = true
      const root = findProjectRoot(process.cwd())
      const appDir = findAppDir(root)
      const sitemap = appDir
        ? ['sitemap.ts', 'sitemap.js', 'sitemap.mjs']
            .map((name) => path.join(appDir, name))
            .find(fs.existsSync)
        : undefined
      const nextSitemap = path.join(root, 'next-sitemap.config.js')

      if (!sitemap && !fs.existsSync(nextSitemap)) {
        report(
          context,
          program,
          'Missing app/sitemap.ts or next-sitemap.config.js; search engines may discover pages slowly.',
        )
        return
      }

      if (sitemap) {
        const text = fs.readFileSync(sitemap, 'utf8')
        if (!/export\s+default\s+(async\s+)?function|export\s+default\s+\w+/.test(text)) {
          report(context, program, `${sitemap} should export a default sitemap function.`)
        }
        if (/url\s*:\s*['"`]\//.test(text)) {
          report(context, program, 'Sitemap entries must use absolute URLs, not relative paths.')
        }
        if (/\[[^/]+\]/.test(text) && !/lastModified/.test(text)) {
          report(context, program, 'Dynamic sitemap entries should include lastModified.')
        }
      }

      const robots = appDir
        ? ['robots.ts', 'robots.js'].map((name) => path.join(appDir, name)).find(fs.existsSync)
        : undefined
      if (robots && !/sitemap\s*:/.test(fs.readFileSync(robots, 'utf8'))) {
        report(context, program, 'app/robots.ts should include a sitemap field pointing to the sitemap URL.')
      }
    },
  }),
  'suggestion',
)
