import { getPathProperty, getStaticString, metadataSources, walk } from '../utils/ast'
import { isPageFile, routeFromFilename } from '../utils/files'
import { createRule, report } from '../utils/rule'

const articleRoutes = /\/(blog|posts?|articles?|news|guides?)(\/|$)/

export const noMissingArticleDates = createRule(
  'no-missing-article-dates',
  'recommend article freshness metadata on content pages',
  (context) => ({
    'Program:exit'(program) {
      if (!isPageFile(context.getFilename())) return
      const route = routeFromFilename(context.getFilename())
      if (!articleRoutes.test(route) || route.split('/').filter(Boolean).length < 2) return

      const sources = metadataSources(program as never)
      const ogType = sources.map((source) => getPathProperty(source, ['openGraph', 'type'])).find(Boolean)
      const ogTypeValue = ogType ? getStaticString(ogType.value) : undefined
      if (ogTypeValue && ogTypeValue !== 'article') {
        report(context, ogType?.node as never, 'Content page should use openGraph.type "article".')
      }
      if (!sources.map((source) => getPathProperty(source, ['openGraph', 'publishedTime'])).find(Boolean)) {
        report(context, program, 'Article page is missing openGraph.publishedTime.')
      }
      if (!sources.map((source) => getPathProperty(source, ['openGraph', 'modifiedTime'])).find(Boolean)) {
        report(context, program, 'Article page is missing openGraph.modifiedTime.')
      }

      let hasArticleJsonLd = false
      let hasDatePublished = false
      walk(program as never, (node) => {
        if (node.type === 'Literal' && (node.value === 'Article' || node.value === 'BlogPosting'))
          hasArticleJsonLd = true
        if (
          node.type === 'Property' &&
          (node.key as { name?: string; value?: string } | undefined)?.name === 'datePublished'
        )
          hasDatePublished = true
      })
      if (hasArticleJsonLd && !hasDatePublished)
        report(context, program, 'Article JSON-LD is missing datePublished.')
    },
  }),
  'suggestion',
)
