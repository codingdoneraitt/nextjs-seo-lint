import path from 'node:path'
import type { Rule } from 'eslint'

export type AstNode = {
  type: string
  loc?: Rule.Node['loc']
  range?: [number, number]
  [key: string]: unknown
}

export type ObjectProperty = {
  key: string
  value: AstNode
  node: AstNode
}

export function getNodeName(node: unknown): string | undefined {
  const typed = node as AstNode | undefined
  if (!typed) return undefined
  if (typed.type === 'Identifier') return typed.name as string
  if (typed.type === 'Literal') return String(typed.value)
  if (typed.type === 'Property' || typed.type === 'PropertyDefinition') {
    return getNodeName(typed.key)
  }
  if (typed.type === 'JSXIdentifier') return typed.name as string
  return undefined
}

export function objectProperties(node: unknown): ObjectProperty[] {
  const typed = node as AstNode | undefined
  if (!typed || typed.type !== 'ObjectExpression') return []
  return ((typed.properties as AstNode[] | undefined) ?? [])
    .filter((property) => property.type === 'Property')
    .map((property) => ({
      key: getNodeName(property.key) ?? '',
      value: property.value as AstNode,
      node: property,
    }))
    .filter((property) => property.key.length > 0)
}

export function getObjectProperty(node: unknown, key: string): ObjectProperty | undefined {
  return objectProperties(node).find((property) => property.key === key)
}

export function getPathProperty(node: unknown, keys: string[]): ObjectProperty | undefined {
  let current = node
  let found: ObjectProperty | undefined
  for (const key of keys) {
    found = getObjectProperty(current, key)
    if (!found) return undefined
    current = found.value
  }
  return found
}

export function getStaticString(node: unknown): string | undefined {
  const typed = node as AstNode | undefined
  if (!typed) return undefined
  if (typed.type === 'Literal' && typeof typed.value === 'string') return typed.value
  if (typed.type === 'TemplateLiteral') {
    const expressions = (typed.expressions as AstNode[] | undefined) ?? []
    const quasis = (typed.quasis as AstNode[] | undefined) ?? []
    if (expressions.length === 0) {
      return quasis.map((quasi) => ((quasi.value as AstNode)?.cooked ?? '') as string).join('')
    }
  }
  return undefined
}

export function isNonEmptyStringNode(node: unknown): boolean {
  const value = getStaticString(node)
  return typeof value === 'string' && value.trim().length > 0
}

export function isEmptyStaticString(node: unknown): boolean {
  const value = getStaticString(node)
  return typeof value === 'string' && value.trim().length === 0
}

export function findMetadataObject(program: AstNode): AstNode | undefined {
  for (const statement of (program.body as AstNode[] | undefined) ?? []) {
    if (statement.type !== 'ExportNamedDeclaration') continue
    const declaration = statement.declaration as AstNode | undefined
    if (!declaration || declaration.type !== 'VariableDeclaration') continue
    for (const item of (declaration.declarations as AstNode[] | undefined) ?? []) {
      if (
        getNodeName(item.id) === 'metadata' &&
        (item.init as AstNode | undefined)?.type === 'ObjectExpression'
      ) {
        return item.init as AstNode
      }
    }
  }
  return undefined
}

export function findGenerateMetadataReturns(program: AstNode): AstNode[] {
  const returns: AstNode[] = []
  walk(program, (node) => {
    if (node.type !== 'ExportNamedDeclaration') return
    const declaration = node.declaration as AstNode | undefined
    if (!declaration) return
    const isNamedFunction =
      declaration.type === 'FunctionDeclaration' && getNodeName(declaration.id) === 'generateMetadata'
    const isVariable =
      declaration.type === 'VariableDeclaration' &&
      ((declaration.declarations as AstNode[] | undefined) ?? []).some(
        (item) => getNodeName(item.id) === 'generateMetadata',
      )
    if (!isNamedFunction && !isVariable) return
    walk(declaration, (child) => {
      if (
        child.type === 'ReturnStatement' &&
        (child.argument as AstNode | undefined)?.type === 'ObjectExpression'
      ) {
        returns.push(child.argument as AstNode)
      }
    })
  })
  return returns
}

export function metadataSources(program: AstNode): AstNode[] {
  const staticMetadata = findMetadataObject(program)
  return [staticMetadata, ...findGenerateMetadataReturns(program)].filter(Boolean) as AstNode[]
}

export function metadataHasNoindex(program: AstNode): boolean {
  const sources = metadataSources(program)
  return sources.length > 0 && sources.every(sourceHasNoindex)
}

export function sourceHasNoindex(source: AstNode): boolean {
  const robots = getPathProperty(source, ['robots'])
  if (!robots) return false

  if (getStaticString(robots.value)?.toLowerCase().includes('noindex')) return true

  const index = getObjectProperty(robots.value, 'index')
  return index?.value.type === 'Literal' && index.value.value === false
}

export function hasNullishFallback(node: unknown): boolean {
  let found = false
  walk(node as AstNode, (child) => {
    if (child.type === 'LogicalExpression' && child.operator === '??' && isNonEmptyStringNode(child.right)) {
      found = true
    }
  })
  return found
}

export function hasDynamicInterpolation(node: unknown): boolean {
  const typed = node as AstNode | undefined
  if (!typed) return false
  if (typed.type === 'TemplateLiteral') {
    return ((typed.expressions as AstNode[] | undefined) ?? []).length > 0
  }
  let found = false
  walk(typed, (child) => {
    if (child.type === 'Identifier' && child.name === 'params') found = true
  })
  return found
}

export function walk(node: AstNode | undefined, visitor: (node: AstNode) => void): void {
  if (!node || typeof node.type !== 'string') return
  visitor(node)
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range' || key === 'tokens' || key === 'comments')
      continue
    if (!value) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && typeof (item as AstNode).type === 'string') {
          walk(item as AstNode, visitor)
        }
      }
    } else if (typeof value === 'object' && typeof (value as AstNode).type === 'string') {
      walk(value as AstNode, visitor)
    }
  }
}

export function jsxAttribute(node: AstNode, name: string): AstNode | undefined {
  const attributes = (node.attributes as AstNode[] | undefined) ?? []
  return attributes.find(
    (attribute) => attribute.type === 'JSXAttribute' && getNodeName(attribute.name) === name,
  )
}

export function jsxAttributeString(node: AstNode, name: string): string | undefined {
  const attribute = jsxAttribute(node, name)
  if (!attribute) return undefined
  const value = attribute.value as AstNode | undefined
  if (!value) return ''
  if (value.type === 'Literal') return String(value.value)
  if (value.type === 'JSXExpressionContainer') return getStaticString(value.expression)
  return undefined
}

export function routeFromFilename(filename: string): string {
  const normalized = filename.split(path.sep).join('/')
  const appIndex = normalized.lastIndexOf('/app/')
  const relative = appIndex >= 0 ? normalized.slice(appIndex + 5) : normalized
  return (
    (
      '/' +
      relative
        .replace(/\/(page|layout)\.[cm]?[jt]sx?$/, '')
        .replace(/\/?$/, '')
        .replace(/\/\([^/]+\)/g, '')
        .replace(/\/route$/, '')
    ).replace(/\/+/g, '/') || '/'
  )
}
