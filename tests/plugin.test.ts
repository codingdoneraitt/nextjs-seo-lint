import path from 'node:path'
import { execFileSync } from 'node:child_process'
import tsParser from '@typescript-eslint/parser'
import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import plugin from '../src/eslint'

describe('seo-lint-next plugin', () => {
  it('exports all v1 rules and a flat recommended config', () => {
    expect(Object.keys(plugin.rules)).toHaveLength(10)
    expect(plugin.configs.recommended[0].rules['seo-lint-next/no-missing-title']).toBe('error')
  })

  it('reports metadata and JSX SEO issues through ESLint', () => {
    const linter = new Linter({ configType: 'eslintrc' } as never)
    linter.defineParser('@typescript-eslint/parser', tsParser as never)
    for (const [name, rule] of Object.entries(plugin.rules)) {
      linter.defineRule(`seo-lint-next/${name}`, rule as never)
    }

    const messages = linter.verify(
      `
        export const metadata = { title: '', description: 'short' }
        export default function Page() {
          return <main><h2>Intro</h2><img src="/x.png" /></main>
        }
      `,
      {
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
        rules: {
          'seo-lint-next/no-missing-title': 'error',
          'seo-lint-next/no-missing-description': 'warn',
          'seo-lint-next/no-broken-heading-hierarchy': 'warn',
          'seo-lint-next/no-img-missing-alt': 'warn',
        },
      } as never,
      { filename: path.join(process.cwd(), 'app/page.tsx') },
    )

    expect(messages.map((message) => message.ruleId)).toContain('seo-lint-next/no-missing-title')
    expect(messages.map((message) => message.ruleId)).toContain('seo-lint-next/no-missing-description')
    expect(messages.map((message) => message.ruleId)).toContain('seo-lint-next/no-broken-heading-hierarchy')
    expect(messages.map((message) => message.ruleId)).toContain('seo-lint-next/no-img-missing-alt')
  })

  it('runs the built CLI against a bad App Router fixture', () => {
    const root = path.join(process.cwd(), 'tests', 'fixtures', 'bad-app')
    let output = ''
    try {
      execFileSync('node', [path.join(process.cwd(), 'dist', 'cli.cjs')], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch (error) {
      output = String((error as { stdout?: string }).stdout ?? '')
    }

    expect(output).toContain('seo-lint-next/no-accidental-noindex')
    expect(output).toContain('seo-lint-next/no-img-missing-alt')
  })

  it('runs the built CLI against a valid App Router fixture', () => {
    const root = path.join(process.cwd(), 'tests', 'fixtures', 'good-app')
    const output = execFileSync('node', [path.join(process.cwd(), 'dist', 'cli.cjs')], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    expect(output.trim()).toBe('')
  })
})
