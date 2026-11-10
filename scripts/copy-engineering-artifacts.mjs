import { copyFile, mkdir, mkdtemp, readdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.resolve(root, '../react-enterprise-client/public')
const destinationDir = path.resolve(root, 'src/assistant/artifacts')

class ArtifactCopyError extends Error {}

function describe(error) {
  if (error instanceof Error && error.message) return error.message
  return String(error)
}

async function listPdfs(directory) {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? error.code : undefined
    const reason =
      code === 'ENOENT'
        ? 'The directory does not exist.'
        : code === 'EACCES' || code === 'EPERM'
          ? 'The directory is not accessible.'
          : describe(error)
    throw new ArtifactCopyError(`Could not read PDF files from ${directory}. ${reason}`, {
      cause: error,
    })
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

export async function publishPdfs(pdfSourceDir, pdfDestinationDir, pdfs) {
  if (pdfs.length === 0) {
    throw new ArtifactCopyError(`No PDF files found in ${pdfSourceDir}`)
  }

  try {
    await mkdir(pdfDestinationDir, { recursive: true })
  } catch (error) {
    throw new ArtifactCopyError(`Could not prepare ${pdfDestinationDir}. ${describe(error)}`, {
      cause: error,
    })
  }

  let stageDir
  try {
    stageDir = await mkdtemp(path.join(pdfDestinationDir, '.incoming-'))
  } catch (error) {
    throw new ArtifactCopyError(
      `Could not prepare a temporary folder in ${pdfDestinationDir}. ${describe(error)}`,
      { cause: error },
    )
  }

  try {
    try {
      for (const name of pdfs) {
        await copyFile(path.join(pdfSourceDir, name), path.join(stageDir, name))
      }
    } catch (error) {
      throw new ArtifactCopyError(
        `Could not copy PDF files into ${pdfDestinationDir}. The existing files were left unchanged. ${describe(error)}`,
        { cause: error },
      )
    }

    let previousDir
    try {
      previousDir = await mkdtemp(path.join(pdfDestinationDir, '.previous-'))
    } catch (error) {
      throw new ArtifactCopyError(
        `Could not prepare a backup folder in ${pdfDestinationDir}. The existing files were left unchanged. ${describe(error)}`,
        { cause: error },
      )
    }

    const published = []
    try {
      const existing = await readdir(pdfDestinationDir, { withFileTypes: true })
      const existingPdfs = existing
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right))
      for (const name of existingPdfs) {
        await rename(path.join(pdfDestinationDir, name), path.join(previousDir, name))
      }
      for (const name of pdfs) {
        await rename(path.join(stageDir, name), path.join(pdfDestinationDir, name))
        published.push(name)
      }
    } catch (error) {
      const restored = await restorePdfs(pdfDestinationDir, previousDir, published)
      await rm(previousDir, { recursive: true, force: true }).catch(() => {})
      const detail = describe(error)
      throw new ArtifactCopyError(
        restored
          ? `Could not replace PDF files in ${pdfDestinationDir}. The previous files were restored. ${detail}`
          : `Could not replace PDF files in ${pdfDestinationDir}. Restoring the previous files failed. ${detail}`,
        { cause: error },
      )
    }

    try {
      await rm(previousDir, { recursive: true, force: true })
    } catch (error) {
      throw new ArtifactCopyError(
        `Copied PDF files to ${pdfDestinationDir}, but could not remove the backup folder ${previousDir}. ${describe(error)}`,
        { cause: error },
      )
    }
  } finally {
    await rm(stageDir, { recursive: true, force: true }).catch(() => {})
  }
}

async function restorePdfs(pdfDestinationDir, previousDir, published) {
  try {
    for (const name of published) {
      await rm(path.join(pdfDestinationDir, name), { force: true })
    }
    for (const name of await readdir(previousDir)) {
      await rename(path.join(previousDir, name), path.join(pdfDestinationDir, name))
    }
    return true
  } catch {
    return false
  }
}

async function main() {
  try {
    const pdfs = await listPdfs(sourceDir)
    if (pdfs.length === 0) {
      throw new ArtifactCopyError(`No PDF files found in ${sourceDir}`)
    }
    await publishPdfs(sourceDir, destinationDir, pdfs)
    console.log(`Copied ${pdfs.length} PDF files to src/assistant/artifacts`)
    for (const name of pdfs) {
      console.log(`- ${name}`)
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
