import {
  getPathProperty,
  getStaticString,
  isValidBcp47,
  metadataSources,
  objectProperties,
} from '../utils/ast'
import { hasLocaleRouting, isPageFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingHreflang = createRule(
  'no-missing-hreflang',
  'require hreflang alternates for locale-routed apps',
  (context) => ({
    'Program:exit'(program) {
      if (!isPageFile(context.getFilename()) || !hasLocaleRouting()) return

      const languages = metadataSources(program as never)
        .map((source) => getPathProperty(source, ['alternates', 'languages']))
        .find(Boolean)

      if (!languages) {
        report(context, program, 'Locale routing detected but alternates.languages is missing.')
        return
      }
      if (languages.value.type !== 'ObjectExpression') return

      let hasDefault = false
      for (const language of objectProperties(languages.value)) {
        if (language.key === 'x-default') hasDefault = true
        if (!isValidBcp47(language.key)) {
          report(
            context,
            language.node as never,
            `Invalid hreflang code "${language.key}"; use BCP-47 such as "en-US".`,
          )
        }
        const url = getStaticString(language.value)
        if (url && !/^https?:\/\//.test(url)) {
          report(context, language.node as never, `hreflang URL must be absolute: "${url}".`)
        }
      }
      if (!hasDefault)
        report(context, languages.node as never, 'alternates.languages should include x-default.')
    },
  }),
  'suggestion',
)
