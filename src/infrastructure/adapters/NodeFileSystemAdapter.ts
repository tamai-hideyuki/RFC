import * as TE from 'fp-ts/TaskEither';
import { promises as fs } from 'fs';
import { FilePath } from '../../domain/valueObjects/FilePath';
import { FileSystemPort } from '../../application/useCases/AddHeadersUseCase';

export const createNodeFileSystemAdapter = (): FileSystemPort => ({
  readDirectory: (path: FilePath): TE.TaskEither<string, string[]> =>
    TE.tryCatch(
      () => fs.readdir(FilePath.toString(path)),
      (error) => `Failed to read directory: ${error}`
    ),

  readFile: (path: FilePath): TE.TaskEither<string, string> =>
    TE.tryCatch(
      () => fs.readFile(FilePath.toString(path), 'utf-8'),
      (error) => `Failed to read file: ${error}`
    ),

  writeFile: (path: FilePath, content: string): TE.TaskEither<string, void> =>
    TE.tryCatch(
      () => fs.writeFile(FilePath.toString(path), content, 'utf-8'),
      (error) => `Failed to write file: ${error}`
    )
});

export const ensureDirectory = (path: FilePath): TE.TaskEither<string, void> =>
  TE.tryCatch(
    async () => {
      await fs.mkdir(FilePath.toString(path), { recursive: true });
    },
    (error) => `Failed to create directory: ${error}`
  );