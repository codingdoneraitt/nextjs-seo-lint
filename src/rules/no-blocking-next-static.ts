import fs from 'node:fs'
import path from 'node:path'
import { findAppDir, findProjectRoot } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checked = false

export const noBlockingNextStatic = createRule(
  'no-blocking-next-static',
  'prevent robots rules from blocking Next.js rendering assets',
  (context) => ({
    'Program:exit'(program) {
      if (checked) return
      checked = true
      const root = findProjectRoot(process.cwd())
      const publicRobots = path.join(root, 'public', 'robots.txt')
      if (fs.existsSync(publicRobots)) {
        const text = fs.readFileSync(publicRobots, 'utf8')
        for (const line of text.split(/\r?\n/)) {
          const match = line.match(/^\s*Disallow:\s*(\S+)/i)
          if (!match) continue
          const value = match[1]
          if (value === '/' || /^\/?_next(?:\/|$)/.test(value)) {
            report(
              context,
              program,
              `robots.txt Disallow: ${value} blocks /_next/ assets needed for rendering.`,
            )
          }
        }
      }

      const appDir = findAppDir(root)
      const robotsTs = appDir
        ? ['robots.ts', 'robots.js'].map((name) => path.join(appDir, name)).find(fs.existsSync)
        : undefined
      if (robotsTs) {
        const text = fs.readFileSync(robotsTs, 'utf8')
        if (
          /disallow\s*:\s*(?:\[[^\]]*)?['"`]\/(?:_next|)['"`]/i.test(text) ||
          /disallow\s*:\s*['"`]\/_next/i.test(text)
        ) {
          report(
            context,
            program,
            'app/robots.ts appears to disallow /_next/ assets; Googlebot needs these files to render pages.',
          )
        }
      }
    },
  }),
)
