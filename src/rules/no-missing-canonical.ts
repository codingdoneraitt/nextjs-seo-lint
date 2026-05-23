import { getPathProperty, getStaticString, hasDynamicInterpolation, metadataSources } from '../utils/ast'
import { hasMetadataBase, isDynamicRoute, isPageFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingCanonical = createRule(
  'no-missing-canonical',
  'require canonical URLs for App Router pages',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isPageFile(filename)) return

      const sources = metadataSources(program as never)
      const canonical = sources
        .map((source) => getPathProperty(source, ['alternates', 'canonical']))
        .find(Boolean)
      if (!canonical) {
        report(
          context,
          program,
          'Page is missing alternates.canonical; duplicate URL variants can split ranking signals.',
        )
        return
      }

      const value = getStaticString(canonical.value)
      if (value && !/^https?:\/\//.test(value) && !value.startsWith('/') && !hasMetadataBase()) {
        report(
          context,
          canonical.node as never,
          'Relative alternates.canonical requires metadataBase in the root app layout.',
        )
      }

      if (isDynamicRoute(filename) && value && !hasDynamicInterpolation(canonical.value)) {
        report(
          context,
          canonical.node as never,
          'Dynamic routes need a param-specific canonical, not a hardcoded URL string.',
        )
      }
    },
  }),
)
