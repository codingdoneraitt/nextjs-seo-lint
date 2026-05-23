import { getPathProperty, getStaticString, metadataSources } from '../utils/ast'
import { isRootLayoutFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingMetadataBase = createRule(
  'no-missing-metadata-base',
  'require production metadataBase in the root app layout',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isRootLayoutFile(filename)) return

      const metadata = metadataSources(program as never)[0]
      const metadataBase = metadata ? getPathProperty(metadata, ['metadataBase']) : undefined
      if (!metadataBase) {
        report(
          context,
          program,
          'Root app layout is missing metadata.metadataBase; relative canonicals and OG images will not resolve safely.',
        )
        return
      }

      const value = metadataBase.value
      if (
        value.type !== 'NewExpression' ||
        (value.callee as any)?.type !== 'Identifier' ||
        (value.callee as any).name !== 'URL'
      ) {
        report(
          context,
          metadataBase.node as never,
          'metadataBase should be created with new URL("https://example.com").',
        )
        return
      }

      const firstArg = Array.isArray(value.arguments) ? value.arguments[0] : undefined
      const literal = getStaticString(firstArg)
      if (literal) {
        if (!literal.startsWith('https://')) {
          report(
            context,
            metadataBase.node as never,
            'metadataBase must use an absolute https:// production URL.',
          )
        }
        if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(literal)) {
          report(
            context,
            metadataBase.node as never,
            'metadataBase must not point at localhost in committed source.',
          )
        }
      }
    },
  }),
)
