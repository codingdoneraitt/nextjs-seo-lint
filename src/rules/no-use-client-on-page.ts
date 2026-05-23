import { hasDirective, hasNamedExport, walk } from '../utils/ast'
import { isPageFile, routeIsPrivate } from '../utils/files'
import { createRule, report } from '../utils/rule'

export const noUseClientOnPage = createRule(
  'no-use-client-on-page',
  'discourage client-only App Router page files',
  (context) => ({
    'Program:exit'(program) {
      if (!isPageFile(context.getFilename())) return
      const options = (context.options[0] ?? {}) as { privateRoutes?: string[] }
      if (routeIsPrivate(context.getFilename(), options.privateRoutes)) return
      if (!hasDirective(program as never, 'use client')) return

      if (hasNamedExport(program as never, 'generateMetadata')) {
        report(
          context,
          program,
          'generateMetadata in a "use client" page is ignored; move metadata to a server wrapper.',
        )
      }
      if (hasNamedExport(program as never, 'metadata')) {
        report(
          context,
          program,
          'metadata export in a "use client" page is ignored; move metadata to a server wrapper.',
        )
      }

      let usesNavigationHook = false
      let hasSuspense = false
      walk(program as never, (node) => {
        if (node.type === 'CallExpression') {
          const callee = node.callee as { name?: string } | undefined
          if (callee?.name === 'useSearchParams' || callee?.name === 'usePathname') usesNavigationHook = true
        }
        if (node.type === 'JSXOpeningElement') {
          const name = (node.name as { name?: string } | undefined)?.name
          if (name === 'Suspense') hasSuspense = true
        }
      })
      if (usesNavigationHook && !hasSuspense) {
        report(
          context,
          program,
          'Client page uses navigation hooks without a visible Suspense boundary; this can trigger client-side rendering bailout.',
        )
      }
      report(
        context,
        program,
        'page.tsx is marked "use client"; keep the page as a server component and move interactivity into child components.',
      )
    },
  }),
  'suggestion',
)
