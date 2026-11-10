import path from 'node:path';
import { loadEngineeringArtifacts } from './artifacts.js';

const { readdir, readFile } = vi.hoisted(() => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({ readdir, readFile }));

describe('loadEngineeringArtifacts', () => {
  const firstDirectory = path.resolve(process.cwd(), 'src/assistant/artifacts');

  beforeEach(() => {
    vi.clearAllMocks();
    readdir.mockImplementation(async (directory: string) =>
      directory === firstDirectory ? ['resume.pdf'] : ['study.pdf'],
    );
    readFile.mockImplementation(async (file: string) => {
      if (String(file).startsWith(firstDirectory)) {
        throw new Error('locked');
      }
      return Buffer.from('pdf');
    });
  });

  it('tries the next directory when a listed PDF cannot be read', async () => {
    await expect(loadEngineeringArtifacts()).resolves.toEqual([
      { name: 'study.pdf', data: Buffer.from('pdf').toString('base64') },
    ]);
  });
});
