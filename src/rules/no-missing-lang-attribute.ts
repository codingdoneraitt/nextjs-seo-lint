import { getNodeName, isValidBcp47, jsxAttribute, jsxAttributeString, walk } from '../utils/ast'
import { isLayoutFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingLangAttribute = createRule(
  'no-missing-lang-attribute',
  'require a valid lang attribute on App Router html elements',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isLayoutFile(filename)) return

      let html: never | undefined
      let langNode: ReturnType<typeof jsxAttribute> | undefined
      let langValue: string | undefined

      walk(program as never, (node) => {
        if (node.type === 'JSXOpeningElement' && getNodeName(node.name) === 'html') {
          html = node as never
          langNode = jsxAttribute(node, 'lang')
          langValue = jsxAttributeString(node, 'lang')
        }
      })

      if (!html) return
      if (!langNode) {
        report(context, html, '<html> is missing a lang attribute.')
        return
      }
      if (langValue !== undefined && !isValidBcp47(langValue)) {
        report(
          context,
          langNode,
          `Invalid lang value "${langValue}"; use a BCP-47 code like "en" or "en-US".`,
        )
      }
      if (/\[(lang|locale)\]/.test(filename) && langValue) {
        report(context, langNode, 'Locale layout should set <html lang> dynamically from route params.')
      }
    },
  }),
)
