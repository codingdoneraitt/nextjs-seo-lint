import { walk } from '../utils/ast'
import { isPageFile, routeDepth } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingBreadcrumbSchema = createRule(
  'no-missing-breadcrumb-schema',
  'recommend BreadcrumbList JSON-LD on deep pages',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isPageFile(filename) || routeDepth(filename) < 3) return

      let hasBreadcrumb = false
      let hasItemList = false
      walk(program as never, (node) => {
        if (node.type === 'Literal' && node.value === 'BreadcrumbList') hasBreadcrumb = true
        if (node.type === 'Literal' && node.value === 'itemListElement') hasItemList = true
        if (
          node.type === 'Property' &&
          (node.key as { name?: string } | undefined)?.name === 'itemListElement'
        )
          hasItemList = true
      })
      if (!hasBreadcrumb) {
        report(context, program, 'Deep page is missing BreadcrumbList JSON-LD.')
      } else if (!hasItemList) {
        report(context, program, 'BreadcrumbList JSON-LD should include itemListElement.')
      }
    },
  }),
  'suggestion',
)
