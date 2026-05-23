import {
  type AstNode,
  getNodeName,
  hasChildElement,
  hasJsxAttribute,
  jsxAttributeString,
  jsxChildText,
} from '../utils/ast'
import { createRule, report } from '../utils/rule'

const generic = new Set([
  'click here',
  'read more',
  'learn more',
  'here',
  'this',
  'more',
  'link',
  'page',
  'go',
  'continue',
  'see more',
  'view more',
])

export const noGenericAnchorText = createRule(
  'no-generic-anchor-text',
  'require descriptive link anchor text',
  (context) => ({
    JSXElement(node: any) {
      const name = getNodeName(node.openingElement?.name)
      if (name !== 'a' && name !== 'Link') return
      const text = jsxChildText(node as never).toLowerCase()
      const label = jsxAttributeString(node.openingElement, 'aria-label')
      const hasDynamicText = hasDynamicTextContent(node as never)
      if (!text && !label) {
        if (hasDynamicText) return
        const hasImage = hasChildElement(node as never, 'img') || hasChildElement(node as never, 'Image')
        report(
          context,
          node as never,
          hasImage
            ? 'Image-only link needs descriptive alt text or aria-label.'
            : 'Link has no accessible anchor text.',
        )
        return
      }
      if (generic.has(text) && !label) {
        report(context, node as never, `Generic anchor text "${text}" should describe the destination.`)
      }
      if (
        (hasChildElement(node as never, 'img') || hasChildElement(node as never, 'Image')) &&
        !label &&
        !hasJsxAttribute(node.openingElement, 'title')
      ) {
        // The image alt rule validates the child image itself; this rule nudges links to expose context too.
        if (!text)
          report(
            context,
            node as never,
            'Image-only link should provide aria-label or visible descriptive text.',
          )
      }
    },
  }),
  'suggestion',
)

function hasDynamicTextContent(node: AstNode): boolean {
  return ((node.children as AstNode[] | undefined) ?? []).some((child) => {
    if (child.type === 'JSXExpressionContainer') {
      const expression = child.expression as AstNode | undefined
      return expression?.type !== 'JSXEmptyExpression'
    }
    if (child.type === 'JSXElement') return hasDynamicTextContent(child)
    return false
  })
}
