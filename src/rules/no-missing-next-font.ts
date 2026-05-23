import fs from 'node:fs'
import path from 'node:path'
import { jsxAttributeString } from '../utils/ast'
import { findAppDir, findProjectRoot, isLayoutFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

let checkedCss = false

export const noMissingNextFont = createRule(
  'no-missing-next-font',
  'prefer next/font over external Google Fonts loading',
  (context) => ({
    JSXOpeningElement(node: any) {
      if (!isLayoutFile(context.getFilename())) return
      if (node.name?.name !== 'link') return
      const href = jsxAttributeString(node as never, 'href') ?? ''
      if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) {
        report(context, node as never, 'Load Google Fonts with next/font instead of external link tags.')
      }
    },
    'Program:exit'(program) {
      if (checkedCss) return
      checkedCss = true
      const appDir = findAppDir(findProjectRoot(process.cwd()))
      if (!appDir) return
      const cssFiles = collectCssFiles(appDir)
      for (const file of cssFiles) {
        if (/@import[^;]+fonts\.googleapis\.com/i.test(fs.readFileSync(file, 'utf8'))) {
          report(context, program, `${file} imports Google Fonts from CSS; use next/font/google instead.`)
        }
      }
    },
  }),
  'suggestion',
)

function collectCssFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectCssFiles(full))
    else if (entry.name.endsWith('.css')) files.push(full)
  }
  return files
}
