import fs from 'node:fs'
import path from 'node:path'

export function findProjectRoot(start = process.cwd()): string {
  let current = path.resolve(start)
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'package.json'))) return current
    current = path.dirname(current)
  }
  return path.resolve(start)
}

export function findAppDir(root = findProjectRoot()): string | undefined {
  const candidates = [path.join(root, 'app'), path.join(root, 'src', 'app')]
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory())
}

export function isPageFile(filename: string): boolean {
  return /(^|\/)page\.[cm]?[jt]sx?$/.test(filename.split(path.sep).join('/'))
}

export function isLayoutFile(filename: string): boolean {
  return /(^|\/)layout\.[cm]?[jt]sx?$/.test(filename.split(path.sep).join('/'))
}

export function isRootLayoutFile(filename: string): boolean {
  const normalized = filename.split(path.sep).join('/')
  return /(^|\/)(src\/)?app\/layout\.[cm]?[jt]sx?$/.test(normalized)
}

export function isAppRouterFile(filename: string): boolean {
  const normalized = filename.split(path.sep).join('/')
  return /(^|\/)(src\/)?app\//.test(normalized)
}

export function isDynamicRoute(filename: string): boolean {
  return /\[[^/]+\]/.test(filename)
}

export function routeIsPrivate(
  filename: string,
  privateRoutes = [
    '/admin',
    '/api',
    '/auth',
    '/dashboard',
    '/login',
    '/private',
    '/quiz',
    '/register',
    '/settings',
    '/sign-in',
    '/sign-up',
  ],
): boolean {
  const normalized = filename.split(path.sep).join('/')
  return privateRoutes.some(
    (route) => normalized.includes(`/app${route}/`) || normalized.includes(`/src/app${route}/`),
  )
}

export function hasMetadataBase(root = findProjectRoot()): boolean {
  const appDir = findAppDir(root)
  if (!appDir) return false
  for (const ext of ['ts', 'tsx', 'js', 'jsx', 'mts', 'mjs']) {
    const file = path.join(appDir, `layout.${ext}`)
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('metadataBase')) return true
  }
  return false
}

export function routeSegmentDir(filename: string): string {
  return path.dirname(filename)
}

export function routeDepth(filename: string): number {
  return routeFromFilename(filename)
    .split('/')
    .filter((segment) => segment && !segment.startsWith('[') && !segment.startsWith('(')).length
}

export function hasLocaleRouting(root = findProjectRoot()): boolean {
  const appDir = findAppDir(root)
  if (!appDir) return false
  return fs
    .readdirSync(appDir, { recursive: true, withFileTypes: true })
    .some((entry) => entry.isDirectory() && /^\[(lang|locale)\]$/.test(entry.name))
}

export function hasDynamicRoutes(root = findProjectRoot()): boolean {
  const appDir = findAppDir(root)
  if (!appDir) return false
  return fs
    .readdirSync(appDir, { recursive: true, withFileTypes: true })
    .some((entry) => entry.isDirectory() && /^\[[^/]+\]$/.test(entry.name))
}

export function hasOpenGraphImageRoute(filename: string): boolean {
  const dir = routeSegmentDir(filename)
  return [
    'opengraph-image.tsx',
    'opengraph-image.ts',
    'opengraph-image.png',
    'opengraph-image.jpg',
    'opengraph-image.jpeg',
  ].some((name) => fs.existsSync(path.join(dir, name)))
}

export function routeFromFilename(filename: string): string {
  const normalized = filename.split(path.sep).join('/')
  const appIndex = normalized.lastIndexOf('/app/')
  const relative = appIndex >= 0 ? normalized.slice(appIndex + 5) : normalized
  const route = relative
    .replace(/\/(page|layout)\.[cm]?[jt]sx?$/, '')
    .replace(/\/?$/, '')
    .replace(/\/\([^/]+\)/g, '')
    .replace(/\/route$/, '')
  return `/${route}`.replace(/\/+/g, '/') || '/'
}
