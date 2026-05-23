import { getPathProperty, getStaticString, metadataSources } from '../utils/ast'
import { isLayoutFile, isPageFile, routeFromFilename } from '../utils/files'
import { createRule, report } from '../utils/rule'

const seenDescriptions = new Map<string, string>()

export const noMissingDescription = createRule(
  'no-missing-description',
  'require useful Next.js metadata descriptions',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isPageFile(filename) && !isLayoutFile(filename)) return

      const option = (context.options[0] ?? {}) as { descriptionLength?: { min?: number; max?: number } }
      const min = option.descriptionLength?.min ?? 120
      const max = option.descriptionLength?.max ?? 160
      const sources = metadataSources(program as never)
      const description = sources.map((source) => getPathProperty(source, ['description'])).find(Boolean)
      if (!description) {
        report(
          context,
          program,
          'Page is missing metadata.description or a generateMetadata() description return value.',
        )
        return
      }

      const value = getStaticString(description.value)
      if (typeof value !== 'string' || value.trim().length === 0) {
        report(context, description.node as never, 'metadata.description must not be empty or whitespace.')
        return
      }

      if (value.length < min || value.length > max) {
        report(
          context,
          description.node as never,
          `metadata.description should be ${min}-${max} characters; found ${value.length}.`,
        )
      }

      const title = sources.map((source) => getPathProperty(source, ['title'])).find(Boolean)
      const titleValue = title ? getStaticString(title.value) : undefined
      if (titleValue && value.startsWith(titleValue)) {
        report(
          context,
          description.node as never,
          'metadata.description should not start with the exact page title.',
        )
      }

      const route = routeFromFilename(filename)
      const previous = seenDescriptions.get(value)
      if (previous && previous !== route) {
        report(
          context,
          description.node as never,
          `Duplicate metadata.description also appears in ${previous}.`,
        )
      } else {
        seenDescriptions.set(value, route)
      }
    },
  }),
  'suggestion',
)
