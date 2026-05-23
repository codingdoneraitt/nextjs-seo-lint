import type { Rule } from 'eslint'
import type { RuleModule } from '../types'

export function createRule(
  name: string,
  description: string,
  create: Rule.RuleModule['create'],
  type: 'problem' | 'suggestion' = 'problem',
): RuleModule {
  return {
    meta: {
      type,
      docs: {
        description,
        recommended: true,
        url: `https://seo-lint-next.dev/rules/${name}`,
      },
      schema: [
        {
          type: 'object',
          additionalProperties: true,
        },
      ],
      messages: {},
    },
    create,
  }
}

export function report(context: Rule.RuleContext, node: unknown, message: string): void {
  context.report({ node: node as Rule.Node, message })
}
