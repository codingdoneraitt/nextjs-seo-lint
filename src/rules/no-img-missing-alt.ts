import { getNodeName, jsxAttribute, jsxAttributeString } from '../utils/ast'
import { createRule, report } from '../utils/rule'

const meaningless = new Set(['image', 'img', 'photo', 'picture', 'screenshot'])

export const noImgMissingAlt = createRule(
  'no-img-missing-alt',
  'require useful alt text and stable Next/Image sizing',
  (context) => {
    let imageIndex = 0
    return {
      JSXOpeningElement(node: any) {
        const typed = node as never
        const name = getNodeName(node.name)
        if (name !== 'img' && name !== 'Image') return

        imageIndex += 1
        if (name === 'img')
          report(context, typed, 'Use next/image instead of raw <img> for optimized image delivery.')

        const altAttribute = jsxAttribute(typed, 'alt')
        if (!altAttribute) {
          report(context, typed, `${name} is missing an alt attribute.`)
        } else {
          const alt = jsxAttributeString(typed, 'alt')
          if (alt === undefined) return
          if (alt.length > 125)
            report(context, altAttribute as never, 'Alt text should stay under 125 characters.')
          const normalized = alt.trim().toLowerCase()
          if (
            normalized &&
            (meaningless.has(normalized) || /\.(png|jpe?g|webp|gif|svg)$/i.test(normalized))
          ) {
            report(
              context,
              altAttribute as never,
              'Alt text is too generic; describe the image content or use alt="" for decorative images.',
            )
          }
        }

        if (name === 'Image') {
          if (!jsxAttribute(typed, 'width') || !jsxAttribute(typed, 'height')) {
            report(context, typed, '<Image> should include width and height props to prevent layout shift.')
          }
          if (imageIndex === 1 && !jsxAttribute(typed, 'priority')) {
            report(
              context,
              typed,
              'The first <Image> in a page is likely above the fold; add priority when it is the LCP image.',
            )
          }
        }
      },
    }
  },
  'suggestion',
)
