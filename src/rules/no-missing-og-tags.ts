import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { getObjectProperty, getPathProperty, getStaticString, metadataSources } from '../utils/ast'
import { hasMetadataBase, hasOpenGraphImageRoute, isPageFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingOgTags = createRule(
  'no-missing-og-tags',
  'require Open Graph and Twitter metadata',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()
      if (!isPageFile(filename)) return

      const source = metadataSources(program as never)[0]
      if (!source) return
      const openGraph = getPathProperty(source, ['openGraph'])
      if (!openGraph) {
        if (!hasOpenGraphImageRoute(filename)) report(context, program, 'Page is missing openGraph metadata.')
        return
      }

      for (const key of ['title', 'description', 'type']) {
        if (!getObjectProperty(openGraph.value, key)) {
          report(context, openGraph.node as never, `openGraph.${key} is missing.`)
        }
      }

      const images = getObjectProperty(openGraph.value, 'images')
      if (!images && !hasOpenGraphImageRoute(filename)) {
        report(
          context,
          openGraph.node as never,
          'openGraph.images is missing and no opengraph-image file exists in this route segment.',
        )
      } else if (
        images?.value.type === 'ArrayExpression' &&
        ((images.value.elements as unknown[]) ?? []).length === 0
      ) {
        report(context, images.node as never, 'openGraph.images must include at least one image.')
      }

      if (images?.value.type === 'ArrayExpression') {
        for (const image of (images.value.elements as never[]) ?? []) {
          if (!image) continue
          const urlNode = getObjectProperty(image, 'url')?.value ?? image
          const url = getStaticString(urlNode)
          if (url?.startsWith('/') && !hasMetadataBase()) {
            report(
              context,
              images.node as never,
              'Relative openGraph image URLs require metadataBase in the root app layout.',
            )
          }
          const width = Number(getObjectProperty(image, 'width')?.value?.value ?? 0)
          const height = Number(getObjectProperty(image, 'height')?.value?.value ?? 0)
          if ((width && width < 800) || (height && height < 418)) {
            report(
              context,
              images.node as never,
              'Open Graph image dimensions should be at least 800x418, ideally 1200x630.',
            )
          }
          if (url?.startsWith('/')) {
            const publicFile = path.join(process.cwd(), 'public', url)
            if (fs.existsSync(publicFile)) {
              const size = imageSize(fs.readFileSync(publicFile))
              if ((size.width ?? 0) < 800 || (size.height ?? 0) < 418) {
                report(context, images.node as never, `Open Graph image file ${url} is smaller than 800x418.`)
              }
            }
          }
        }
      }

      const twitter = getObjectProperty(source, 'twitter')
      if (!twitter) {
        report(
          context,
          source as never,
          'twitter metadata is missing; set twitter.card and twitter.images for share previews.',
        )
        return
      }
      const card = getObjectProperty(twitter.value, 'card')
      if (!card)
        report(
          context,
          twitter.node as never,
          'twitter.card is missing; use "summary_large_image" for OG-style previews.',
        )
      if (
        getStaticString(card?.value) === 'summary_large_image' &&
        !getObjectProperty(twitter.value, 'images')
      ) {
        report(
          context,
          twitter.node as never,
          'twitter.images is required when twitter.card is "summary_large_image".',
        )
      }
    },
  }),
  'suggestion',
)
