#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import tsParser from '@typescript-eslint/parser'
import fg from 'fast-glob'
import { Linter } from 'eslint'
import plugin from './eslint'

type CliOptions = {
  dir: string
  format: 'stylish' | 'json'
  strict: boolean
}

const defaultSeverities: Record<string, 0 | 1 | 2> = {
  'no-missing-title': 2,
  'no-missing-metadata-base': 2,
  'no-missing-description': 1,
  'no-missing-canonical': 2,
  'no-missing-og-tags': 1,
  'no-broken-heading-hierarchy': 1,
  'no-img-missing-alt': 1,
  'no-accidental-noindex': 2,
  'no-missing-sitemap': 1,
  'no-invalid-json-ld': 2,
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const cwd = process.cwd()
  const appDir = path.resolve(cwd, options.dir)

  if (!fs.existsSync(appDir)) {
    console.error(`seo-lint-next: app directory not found: ${options.dir}`)
    process.exitCode = 2
    return
  }

  const files = await fg(['**/*.{ts,tsx,js,jsx,mts,mjs}'], {
    cwd: appDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**'],
  })

  const linter = createLinter()
  const rules = Object.fromEntries(
    Object.keys(defaultSeverities).map((ruleName) => [
      `seo-lint-next/${ruleName}`,
      options.strict && defaultSeverities[ruleName] === 1 ? 2 : defaultSeverities[ruleName],
    ]),
  )

  const results = files.map((filePath) => {
    const text = fs.readFileSync(filePath, 'utf8')
    const messages = linter.verify(
      text,
      {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
        rules,
      } as never,
      { filename: filePath },
    )
    return { filePath, messages }
  })

  if (options.format === 'json') {
    console.log(JSON.stringify(results, null, 2))
  } else {
    printStylish(results)
  }

  const hasErrors = results.some((result) => result.messages.some((message) => message.severity === 2))
  process.exitCode = hasErrors ? 1 : 0
}

function createLinter(): Linter {
  let linter: Linter
  try {
    linter = new Linter({ configType: 'eslintrc' } as never)
  } catch {
    linter = new Linter()
  }
  linter.defineParser('@typescript-eslint/parser', tsParser as never)
  for (const [ruleName, rule] of Object.entries(plugin.rules)) {
    linter.defineRule(`seo-lint-next/${ruleName}`, rule as never)
  }
  return linter
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { dir: 'app', format: 'stylish', strict: false }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--dir') options.dir = args[++index] ?? options.dir
    else if (arg === '--format') {
      const format = args[++index]
      if (format === 'json' || format === 'stylish') options.format = format
      else throw new Error(`Unsupported format: ${format}`)
    } else if (arg === '--strict') options.strict = true
    else if (arg === '--help' || arg === '-h') {
      console.log(`seo-lint-next

Usage:
  seo-lint-next [--dir app] [--format stylish|json] [--strict]

Options:
  --dir       App Router directory to lint. Defaults to app.
  --format    Output format. Defaults to stylish.
  --strict    Treat warnings as errors.
`)
      process.exit(0)
    }
  }
  return options
}

function printStylish(results: Array<{ filePath: string; messages: Linter.LintMessage[] }>): void {
  let count = 0
  for (const result of results) {
    if (result.messages.length === 0) continue
    console.log(result.filePath)
    for (const message of result.messages) {
      count += 1
      const level = message.severity === 2 ? 'error' : 'warning'
      const line = String(message.line ?? 1).padStart(4)
      const column = String(message.column ?? 1).padEnd(3)
      console.log(`  ${line}:${column}  ${level.padEnd(7)}  ${message.message}  ${message.ruleId ?? ''}`)
    }
    console.log('')
  }
  if (count > 0) console.log(`${count} SEO issue${count === 1 ? '' : 's'} found.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 2
})
