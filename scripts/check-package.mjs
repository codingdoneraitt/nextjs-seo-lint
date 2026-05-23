import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-lint-next-pack-'))

try {
  execFileSync('npx', ['publint'], { cwd: root, stdio: 'inherit' })
  execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', packDir], {
    cwd: root,
    stdio: 'inherit',
  })

  const tarball = fs.readdirSync(packDir).find((file) => file.endsWith('.tgz'))
  if (!tarball) throw new Error('npm pack did not produce a tarball')

  const nodeMajor = Number(process.versions.node.split('.')[0])
  if (nodeMajor < 20 || nodeMajor > 24) {
    console.warn(`Skipping attw on Node ${process.versions.node}; CI runs it on supported Node 20/22.`)
  } else {
    execFileSync('npx', ['attw', path.join(packDir, tarball)], { cwd: root, stdio: 'inherit' })
  }
} finally {
  fs.rmSync(packDir, { recursive: true, force: true })
}
