import { getNodeName, getStaticString, jsxAttributeString, walk } from '../utils/ast'
import { isPageFile, routeFromFilename } from '../utils/files'
import { createRule, report } from '../utils/rule'

const requiredFields: Record<string, string[]> = {
  Article: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  Blog: ['name'],
  CollectionPage: ['name'],
  Product: ['name', 'offers'],
  Quiz: ['name'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  Person: ['name'],
  Event: ['name', 'startDate', 'location'],
}

const recognized = new Set(Object.keys(requiredFields))

export const noInvalidJsonLd = createRule(
  'no-invalid-json-ld',
  'validate JSON-LD syntax and required schema fields',
  (context) => {
    let scriptCount = 0
    return {
      JSXElement(node: any) {
        const opening = node.openingElement
        if (getNodeName(opening?.name) === 'JsonLd') {
          scriptCount += 1
          return
        }

        if (getNodeName(opening?.name) !== 'script') return
        if (jsxAttributeString(opening, 'type') !== 'application/ld+json') return
        scriptCount += 1

        const html = (opening.attributes ?? []).find(
          (attribute: any) => getNodeName(attribute.name) === 'dangerouslySetInnerHTML',
        )
        if (html) {
          const text = context.sourceCode.getText(html)
          if (!/JSON\.stringify/.test(text) && !/__html\s*:\s*['"`{]/.test(text)) {
            report(
              context,
              html,
              'JSON-LD dangerouslySetInnerHTML should pass JSON.stringify(data) or a static JSON string.',
            )
          }
          return
        }

        const text = extractScriptText((node.children ?? []) as any[])
        if (!text) return
        try {
          validateJsonLd(JSON.parse(text), (message) => report(context, node as never, message))
        } catch {
          report(context, node as never, 'JSON-LD script contains invalid JSON.')
        }
      },
      'Program:exit'(program) {
        if (!isPageFile(context.getFilename())) return
        const route = routeFromFilename(context.getFilename())
        if (/\/(blog|posts|product|products|articles)(\/|$)/.test(route) && scriptCount === 0) {
          report(context, program, 'Content page is missing an application/ld+json structured data block.')
        }
        let websiteSchema = false
        walk(program as never, (child) => {
          if (child.type === 'Literal' && child.value === 'WebSite') websiteSchema = true
        })
        if (/\/layout\.[cm]?[jt]sx?$/.test(context.getFilename()) && !websiteSchema) {
          report(
            context,
            program,
            'Root layout should include WebSite JSON-LD with SearchAction for sitelinks search eligibility.',
          )
        }
      },
    }
  },
)

function extractScriptText(children: any[]): string {
  return children
    .map((child) => {
      if (typeof child.value === 'string') return child.value
      if (child.type === 'JSXExpressionContainer') return getStaticString(child.expression) ?? ''
      return ''
    })
    .join('')
    .trim()
}

function validateJsonLd(value: unknown, onError: (message: string) => void): void {
  const items = Array.isArray(value) ? value : [value]
  const byType = new Map<string, string>()
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    if (record['@context'] !== 'https://schema.org')
      onError('JSON-LD @context must be exactly "https://schema.org".')
    const type = String(record['@type'] ?? '')
    if (!recognized.has(type))
      onError(`JSON-LD @type "${type || '(missing)'}" is not in the built-in recognized type list.`)
    const missing = (requiredFields[type] ?? []).filter((field) => record[field] == null)
    if (missing.length > 0) onError(`JSON-LD ${type} is missing required field(s): ${missing.join(', ')}.`)
    const serialized = JSON.stringify(record)
    const previous = byType.get(type)
    if (previous && previous !== serialized)
      onError(`Multiple JSON-LD ${type} blocks contain conflicting data.`)
    byType.set(type, serialized)
  }
}
