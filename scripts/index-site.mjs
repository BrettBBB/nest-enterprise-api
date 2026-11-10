import { access, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const clientRoot = path.resolve(root, '../react-enterprise-client')
const shellDir = path.join(clientRoot, 'src/shell')
const outputPath = path.join(root, 'src/assistant/artifacts/site-map.json')

try {
  await access(path.join(shellDir, 'routes.ts'))
  await access(path.join(shellDir, 'AppShell.tsx'))
} catch {
  try {
    await access(outputPath)
  } catch {
    console.error(
      `Could not index pages. ${clientRoot} is not beside this API, and src/assistant/artifacts/site-map.json does not exist yet.`,
    )
    process.exit(1)
  }
  console.log('Client source is not beside this API. Keeping the existing site map.')
  process.exit(0)
}

const routesSource = await readFile(path.join(shellDir, 'routes.ts'), 'utf8')
const shellSource = await readFile(path.join(shellDir, 'AppShell.tsx'), 'utf8')
const paths = readObjectStrings(routesSource, 'export const paths')
const titles = readPathTitles(routesSource, paths)
const labels = {
  ...readPathLabels(routesSource),
  ...readPathLabels(shellSource),
}
const navigation = readNavigation(shellSource, routesSource, paths, labels)
const components = readComponents(shellSource, shellDir)
const pages = await readRoutes(shellSource, paths, titles, labels, components)

const siteMap = { generatedBy: 'pnpm site:index', navigation, pages }
await writeFile(outputPath, `${JSON.stringify(siteMap, null, 2)}\n`)
console.log(`Indexed ${pages.length} routes into src/assistant/artifacts/site-map.json`)
for (const page of pages) {
  console.log(`- ${page.path} ${page.title}`)
}

function readObjectStrings(source, declaration) {
  const body = blockAfter(source, declaration)
  const values = {}
  for (const match of body.matchAll(/(\w+)\s*:\s*"([^"]*)"/g)) {
    values[match[1]] = match[2]
  }
  return values
}

function readPathTitles(source, pathValues) {
  const body = blockAfter(source, 'const titles')
  const titles = {}
  for (const match of body.matchAll(/\[paths\.(\w+)\]\s*:\s*"([^"]*)"/g)) {
    const routePath = pathValues[match[1]]
    if (routePath) titles[routePath] = match[2]
  }
  return titles
}

function readPathLabels(source) {
  const labels = {}
  for (const match of source.matchAll(/path:\s*paths\.(\w+)\s*,\s*label:\s*"([^"]*)"/g)) {
    labels[match[1]] = match[2]
  }
  return labels
}

function readNavigation(shellSource, routesSource, pathValues, labelByKey) {
  const items = []
  for (const key of orderedKeys(shellSource, 'const leadingPages')) {
    items.push({ label: labelByKey[key] ?? titleFromKey(key), path: pathValues[key] })
  }
  const children = orderedKeys(routesSource, 'export const medicalCostControlPages').map((key) => ({
    label: labelByKey[key] ?? titleFromKey(key),
    path: pathValues[key],
  }))
  if (children.length > 0) {
    items.push({ label: 'Medical Cost Control', children })
  }
  if (pathValues.contact) {
    items.push({ label: labelByKey.contact ?? 'Contact', path: pathValues.contact })
  }
  return items
}

function orderedKeys(source, declaration) {
  const body = blockAfter(source, declaration)
  return [...body.matchAll(/paths\.(\w+)/g)].map((match) => match[1])
}

function readComponents(source, fromDir) {
  const components = new Map()
  for (const match of source.matchAll(
    /import\s*\{([^}]+)\}\s*from\s*"(\.\.?\/[^"]+\.tsx)"/g,
  )) {
    for (const name of match[1].split(',').map((part) => part.trim()).filter(Boolean)) {
      components.set(name, path.resolve(fromDir, match[2]))
    }
  }
  for (const match of source.matchAll(
    /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\("(\.\.?\/[^"]+\.tsx)"\)/g,
  )) {
    components.set(match[1], path.resolve(fromDir, match[2]))
  }
  return components
}

async function readRoutes(source, pathValues, titles, labelByKey, components) {
  const routesBlock = source.slice(source.indexOf('<Routes>'), source.indexOf('</Routes>'))
  const pages = []
  for (const chunk of routesBlock.split(/<Route\b/).slice(1)) {
    const pathMatch = chunk.match(/path=\{paths\.(\w+)\}|path="([^"]+)"/)
    if (!pathMatch) continue
    const pathKey = pathMatch[1]
    const routePath = pathKey ? pathValues[pathKey] : pathMatch[2]
    const redirect = chunk.match(/<Navigate\s+to=\{paths\.(\w+)\}|<Navigate\s+to="([^"]+)"/)
    const redirectTo = redirect ? (redirect[1] ? pathValues[redirect[1]] : redirect[2]) : undefined
    const names = [...chunk.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1])
    const componentName =
      names.find((name) => !['Navigate', 'MedicalCostPage', 'Suspense', 'UsersRoute'].includes(name)) ??
      (names.includes('UsersRoute') ? 'UsersPage' : undefined)
    const componentPath = componentName ? components.get(componentName) : undefined
    pages.push({
      path: routePath,
      title: titles[routePath] ?? (pathKey ? labelByKey[pathKey] : undefined) ?? routeTitle(routePath),
      label: (pathKey ? labelByKey[pathKey] : undefined) ?? titles[routePath] ?? routeTitle(routePath),
      component: componentName ?? (redirectTo ? 'Navigate' : 'Route'),
      source: componentPath ? path.relative(path.resolve(root, '..'), componentPath).replaceAll('\\', '/') : 'react-enterprise-client/src/shell/AppShell.tsx',
      access: accessFor(pathKey, source),
      redirectTo,
      text: '',
    })
  }
  return Promise.all(pages.map(async (page) => ({ ...page, text: await pageText(page, source) })))
}

function accessFor(pathKey, source) {
  if (pathKey === 'users') {
    return 'Guests see the sign-in form. A signed-in visitor who is not an administrator is told the user directory is limited to administrators.'
  }
  if (pathKey === 'signIn' && /pathname === paths\.signIn[\s\S]{0,120}navigate\(paths\.home/.test(source)) {
    return 'A signed-in visitor is returned to Home.'
  }
  if (!pathKey) return 'This path is a redirect.'
  return 'Listed in the primary navigation.'
}

async function pageText(page, shellSource) {
  const parts = []
  if (page.component === 'UsersPage') {
    parts.push(...visibleText(functionBody(shellSource, 'function UsersRoute')))
  }
  if (page.source.endsWith('.tsx') && !page.source.endsWith('AppShell.tsx')) {
    const filePath = path.resolve(root, '..', page.source)
    parts.push(...(await textFromFile(filePath, page.component, 0)))
  }
  if (page.redirectTo) {
    parts.push(`This path redirects to ${page.redirectTo}.`)
  }
  return [...new Set(parts)].join('\n')
}

async function textFromFile(filePath, componentName, depth) {
  let source = ''
  try {
    source = await readFile(filePath, 'utf8')
  } catch {
    return []
  }
  const texts = visibleText(componentSource(source, componentName))
  if (depth >= 1) return texts
  const dir = path.dirname(filePath)
  for (const match of source.matchAll(/from\s*["'](\.\/[^"']+\.tsx)["']/g)) {
    if (match[1].includes('.test.')) continue
    texts.push(...(await textFromFile(path.resolve(dir, match[1]), '', depth + 1)))
  }
  return texts
}

function componentSource(source, componentName) {
  if (!componentName) return source
  const signature = `function ${componentName}`
  const start = source.indexOf(signature)
  if (start < 0) return source
  const body = functionBody(source, signature)
  const prelude = source.slice(0, start)
  let related = body
  const seen = new Set()
  const pending = [body]
  while (pending.length > 0) {
    const chunk = pending.pop()
    for (const match of chunk.matchAll(/\b([A-Za-z][A-Za-z0-9]*)\b/g)) {
      const name = match[1]
      if (seen.has(name)) continue
      if (!prelude.includes(`const ${name} `) && !prelude.includes(`const ${name}=`)) continue
      seen.add(name)
      try {
        const block = blockAfter(prelude, `const ${name}`)
        related += block
        pending.push(block)
      } catch {
        // The name is not a block.
      }
    }
  }
  return related
}

function visibleText(source) {
  const cleaned = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
  const texts = []
  for (const match of cleaned.matchAll(/>([^<>{}]+)</g)) {
    const text = cleanText(match[1])
    if (isVisibleCopy(text) && text.length > 1) texts.push(text)
  }
  for (const match of cleaned.matchAll(
    /(?:headerName|label|title|placeholder|aria-label|alt)\s*[:=]\s*['"]([^'"]*)['"]/g,
  )) {
    const text = cleanText(match[1])
    if (isVisibleCopy(text)) texts.push(text)
  }
  for (const match of cleaned.matchAll(/['"]([^'"\\]*(?:\\.[^'"\\]*)*)['"]/g)) {
    const text = cleanText(match[1].replace(/\\n/g, ' '))
    if (!text || text.length < 24 || text.length > 1500 || !text.includes(' ')) continue
    if (!isVisibleCopy(text) || text.startsWith('.') || text.startsWith('@') || text.includes('${')) continue
    if (/^[a-z0-9\s-]+$/.test(text) && text.includes('-')) continue
    const letters = text.match(/[A-Za-z]/g)?.length ?? 0
    if (letters < text.length * 0.5) continue
    texts.push(text)
  }
  return texts
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function isVisibleCopy(text) {
  if (!text || !/[A-Za-z]/.test(text)) return false
  return !/[{};]|const |useState|=>|function |return /.test(text)
}

function functionBody(source, signature) {
  const start = source.indexOf(signature)
  if (start < 0) return ''
  const brace = source.indexOf('{', start)
  let depth = 0
  for (let index = brace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(brace, index + 1)
    }
  }
  return ''
}

function blockAfter(source, declaration) {
  const start = source.indexOf(declaration)
  if (start < 0) throw new Error(`Could not find ${declaration} while indexing routes.`)
  const assign = source.indexOf('=', start)
  const relative = source.slice(assign).search(/[{[]/)
  const openIndex = assign + relative
  const open = source[openIndex]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === open) depth += 1
    if (source[index] === close) {
      depth -= 1
      if (depth === 0) return source.slice(openIndex + 1, index)
    }
  }
  throw new Error(`Could not read the block after ${declaration}.`)
}

function routeTitle(routePath) {
  if (routePath === '*') return 'Unknown path'
  const segment = routePath.split('/').filter(Boolean).at(-1) ?? 'Home'
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function titleFromKey(key) {
  return key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())
}
