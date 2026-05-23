import fs from 'node:fs'
import path from 'node:path'
import { getObjectProperty, getStaticBoolean, getStaticString, walk } from '../utils/ast'
import { isAppRouterFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noDynamicImportSsrFalseOnContent = createRule(
  'no-dynamic-import-ssr-false-on-content',
  'warn when dynamic imports disable SSR for likely indexable content',
  (context) => ({
    CallExpression(node: any) {
      if (!isAppRouterFile(context.getFilename())) return
      if (node.callee?.name !== 'dynamic') return
      const options = node.arguments?.[1]
      if (!options || options.type !== 'ObjectExpression') return
      if (getStaticBoolean(getObjectProperty(options, 'ssr')?.value) !== false) return

      const importPath = extractImportPath(node.arguments?.[0])
      const target = importPath ? `dynamic("${importPath}", { ssr: false })` : 'dynamic(..., { ssr: false })'
      report(
        context,
        node as never,
        `${target} skips server rendering; keep headings and indexable copy out of this component.`,
      )

      if (importPath && /hero|content|article|post|page|body/i.test(importPath)) {
        report(
          context,
          node as never,
          `${target} looks like primary content and should usually render on the server.`,
        )
      }
      if (importPath && importedFileHasHeadings(context.getFilename(), importPath)) {
        report(
          context,
          node as never,
          `${target} imports heading tags that Googlebot will not see in server HTML.`,
        )
      }
    },
  }),
  'suggestion',
)

function extractImportPath(node: any): string | undefined {
  let found: string | undefined
  walk(node as never, (child) => {
    if (child.type === 'ImportExpression') found = getStaticString(child.source)
    if (child.type === 'CallExpression' && (child.callee as { type?: string }).type === 'Import') {
      found = getStaticString((child.arguments as unknown[] | undefined)?.[0])
    }
  })
  return found
}

function importedFileHasHeadings(fromFile: string, importPath: string): boolean {
  if (!importPath.startsWith('.')) return false
  const base = path.resolve(path.dirname(fromFile), importPath)
  const candidate = ['.tsx', '.ts', '.jsx', '.js'].map((ext) => `${base}${ext}`).find(fs.existsSync)
  if (!candidate) return false
  return /<h[1-6]\b/.test(fs.readFileSync(candidate, 'utf8'))
}
