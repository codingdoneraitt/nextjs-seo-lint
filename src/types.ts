import type { Rule } from 'eslint'

export type SeverityName = 'off' | 'warn' | 'error'

export type SeoLintConfig = {
  appDir?: string
  privateRoutes?: string[]
  descriptionLength?: {
    min?: number
    max?: number
  }
  rules?: Record<string, SeverityName>
}

export type RuleModule = Rule.RuleModule & {
  meta: Rule.RuleMetaData & {
    docs: NonNullable<Rule.RuleMetaData['docs']> & {
      recommended?: boolean
      url?: string
    }
  }
}
