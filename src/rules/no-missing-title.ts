import {
  getPathProperty,
  getStaticString,
  isEmptyStaticString,
  metadataHasNoindex,
  metadataSources,
} from '../utils/ast'
import { isPageFile, isRootLayoutFile, routeFromFilename, routeIsPrivate } from '../utils/files'
import { createRule, report } from '../utils/rule'

const seenTitles = new Map<string, string>()

export const noMissingTitle = createRule(
  'no-missing-title',
  'require useful Next.js metadata titles',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isPageFile(filename) && !isRootLayoutFile(filename)) return
      const options = (context.options[0] ?? {}) as { privateRoutes?: string[] }
      if (
        isPageFile(filename) &&
        (routeIsPrivate(filename, options.privateRoutes) || metadataHasNoindex(program as never))
      )
        return

      const sources = metadataSources(program as never)
      const title = sources.map((source) => getPathProperty(source, ['title'])).find(Boolean)

      if (!title) {
        report(context, program, 'Page is missing metadata.title or a generateMetadata() title return value.')
        return
      }

      if (isEmptyStaticString(title.value)) {
        report(context, title.node as never, 'metadata.title must not be empty or whitespace.')
      }

      const titleString = getStaticString(title.value)
      if (titleString?.trim()) {
        const route = routeFromFilename(filename)
        const previous = seenTitles.get(titleString)
        if (previous && previous !== filename) {
          report(
            context,
            title.node as never,
            `Duplicate metadata.title "${titleString}" also appears in ${previous}.`,
          )
        } else {
          seenTitles.set(titleString, route)
        }
      }

      if (isRootLayoutFile(filename) && !getPathProperty(title.value, ['template'])) {
        report(
          context,
          title.node as never,
          'Root/layout metadata.title should define a title.template such as "%s | Brand".',
        )
      }
    },
  }),
)
