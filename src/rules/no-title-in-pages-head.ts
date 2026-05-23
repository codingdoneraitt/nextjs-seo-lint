import { getNodeName, hasChildElement, hasImportFrom, hasNamedExport } from '../utils/ast'
import { isAppRouterFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noTitleInPagesHead = createRule(
  'no-title-in-pages-head',
  'disallow next/head metadata in App Router files',
  (context) => ({
    'Program:exit'(program) {
      if (!isAppRouterFile(context.getFilename())) return
      if (hasImportFrom(program as never, 'next/head')) {
        report(context, program, 'next/head is a Pages Router API; use App Router metadata exports instead.')
        if (hasNamedExport(program as never, 'metadata')) {
          report(context, program, 'Do not mix next/head with metadata exports in App Router files.')
        }
      }
    },
    JSXElement(node: any) {
      if (!isAppRouterFile(context.getFilename())) return
      if (getNodeName(node.openingElement?.name) !== 'Head') return
      if (hasChildElement(node as never, 'title') || hasChildElement(node as never, 'meta')) {
        report(
          context,
          node as never,
          '<Head> with <title>/<meta> is not supported in App Router; use metadata exports.',
        )
      }
    },
  }),
)
