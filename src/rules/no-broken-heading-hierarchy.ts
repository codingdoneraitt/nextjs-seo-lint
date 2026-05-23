import { getNodeName, jsxAttributeString } from '../utils/ast'
import { isPageFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noBrokenHeadingHierarchy = createRule(
  'no-broken-heading-hierarchy',
  'require one h1 and sequential heading levels',
  (context) => {
    const headings: Array<{ level: number; node: never; empty: boolean }> = []
    return {
      JSXOpeningElement(node: any) {
        if (!isPageFile(context.getFilename())) return
        const name = getNodeName(node.name)
        if (!name || !/^h[1-6]$/.test(name)) return
        const ariaHidden = jsxAttributeString(node as never, 'aria-hidden')
        headings.push({ level: Number(name.slice(1)), node: node as never, empty: ariaHidden === 'true' })
      },
      'Program:exit'(program) {
        if (!isPageFile(context.getFilename())) return
        const h1s = headings.filter((heading) => heading.level === 1)
        if (h1s.length === 0)
          report(context, program, 'Page has no <h1>; each indexable page should expose one primary heading.')
        if (h1s.length > 1) {
          for (const h1 of h1s.slice(1))
            report(context, h1.node, 'Page has more than one <h1>; keep one primary topic heading.')
        }
        for (let index = 1; index < headings.length; index += 1) {
          if (headings[index].level > headings[index - 1].level + 1) {
            report(
              context,
              headings[index].node,
              `Heading level jumps from h${headings[index - 1].level} to h${headings[index].level}.`,
            )
          }
        }
      },
    }
  },
  'suggestion',
)
