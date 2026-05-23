import {
  getObjectProperty,
  getPathProperty,
  getStaticNumber,
  metadataSources,
  objectProperties,
} from '../utils/ast'
import { isPageFile } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noMissingOgImageDimensions = createRule(
  'no-missing-og-image-dimensions',
  'require explicit Open Graph image dimensions and alt text',
  (context) => ({
    'Program:exit'(program) {
      const filename = context.getFilename()

      if (/\/opengraph-image\.[cm]?[jt]sx?$/.test(filename.replaceAll('\\', '/'))) {
        const size = metadataSources(program as never)
          .map((source) => getObjectProperty(source, 'size'))
          .find(Boolean)
        void size
      }

      if (!isPageFile(filename)) return
      const images = metadataSources(program as never)
        .map((source) => getPathProperty(source, ['openGraph', 'images']))
        .find(Boolean)
      if (!images || images.value.type !== 'ArrayExpression') return

      for (const image of (images.value.elements as any[] | undefined) ?? []) {
        if (!image || image.type !== 'ObjectExpression') continue
        const props = Object.fromEntries(objectProperties(image).map((property) => [property.key, property]))
        const width = getStaticNumber(props.width?.value)
        const height = getStaticNumber(props.height?.value)
        if (!width || !height) {
          report(context, image as never, 'Open Graph image is missing explicit width and height.')
        } else if (width < 800 || height < 418) {
          report(
            context,
            image as never,
            `Open Graph image is too small (${width}x${height}); minimum is 800x418.`,
          )
        } else if (width < 1200 || height < 630) {
          report(
            context,
            image as never,
            `Open Graph image is below ideal size (${width}x${height}); recommend 1200x630.`,
          )
        }
        if (!props.alt) report(context, image as never, 'Open Graph image should include alt text.')
      }
    },
  }),
  'suggestion',
)
