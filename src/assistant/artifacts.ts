import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ServiceUnavailableException } from '@nestjs/common';

export type EngineeringArtifact = {
  name: string;
  data: string;
};

export const artifactDirectories = [
  path.resolve(process.cwd(), 'src/assistant/artifacts'),
  fileURLToPath(new URL('./artifacts/', import.meta.url)),
  path.resolve(process.cwd(), 'dist/src/assistant/artifacts'),
  path.resolve(process.cwd(), 'dist/assistant/artifacts'),
];

export async function loadEngineeringArtifacts(): Promise<EngineeringArtifact[]> {
  for (const directory of artifactDirectories) {
    const artifacts = await readPdfDirectory(directory);
    if (artifacts.length > 0) {
      return artifacts;
    }
  }

  throw new ServiceUnavailableException('The engineering artifacts are not available.');
}

async function readPdfDirectory(directory: string): Promise<EngineeringArtifact[]> {
  let names: string[];
  try {
    names = await readdir(directory);
  } catch {
    return [];
  }

  const pdfs = names
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .sort((left, right) => left.localeCompare(right));
  try {
    return await Promise.all(
      pdfs.map(async (name) => ({
        name,
        data: (await readFile(path.join(directory, name))).toString('base64'),
      })),
    );
  } catch {
    return [];
  }
}
