import {
  findNamedExportInit,
  getObjectProperty,
  getStaticString,
  metadataSources,
  objectProperties,
} from '../utils/ast'
import { isLayoutFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingViewport = createRule(
  'no-missing-viewport',
  'prevent broken viewport overrides',
  (context) => ({
    'Program:exit'(program) {
      if (!isLayoutFile(context.getFilename())) return

      const metadataViewport = metadataSources(program as never)
        .map((source) => getObjectProperty(source, 'viewport'))
        .find(Boolean)
      const exportedViewport = findNamedExportInit(program as never, 'viewport')
      const viewportNode = metadataViewport?.value ?? exportedViewport
      if (!viewportNode) return

      const values =
        viewportNode.type === 'ObjectExpression'
          ? objectProperties(viewportNode).map(
              (property) => `${property.key}=${getStaticString(property.value) ?? ''}`,
            )
          : [getStaticString(viewportNode) ?? '']
      const text = values.join(',').toLowerCase()

      if (text.trim().length === 0) {
        report(
          context,
          metadataViewport?.node ?? viewportNode,
          'Viewport override must not be empty; omit it to use the Next.js default.',
        )
        return
      }
      if (!/width\s*=\s*device-width/.test(text)) {
        report(
          context,
          metadataViewport?.node ?? viewportNode,
          'Viewport override must include width=device-width.',
        )
      }
      if (/user-scalable\s*=\s*no/.test(text) || /maximum-scale\s*=\s*1(?:\.0)?(?:,|$)/.test(text)) {
        report(
          context,
          metadataViewport?.node ?? viewportNode,
          'Viewport must not disable user zoom with user-scalable=no or maximum-scale=1.',
        )
      }
      if (/initial-scale/.test(text) && !/initial-scale\s*=\s*1(?:\.0)?(?:,|$)/.test(text)) {
        report(context, metadataViewport?.node ?? viewportNode, 'Viewport initial-scale should be 1.')
      }
    },
  }),
)
