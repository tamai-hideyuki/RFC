import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { FilePath } from '../../domain/valueObjects/FilePath';
import { FileSystemPort } from './AddHeadersUseCase';

export interface CheckTitlesResult {
  validFiles: string[];
  emptyTitleFiles: string[];
  noThirdLineFiles: string[];
}

export const createCheckTitlesUseCase = (fs: FileSystemPort) => {
  const checkFile = (
    dirPath: FilePath,
    filename: string
  ): TE.TaskEither<string, { filename: string; status: 'valid' | 'empty_title' | 'no_third_line' }> => {
    const filePath = FilePath.join(dirPath, { _tag: 'FilePath', value: filename });

    return pipe(
      fs.readFile(filePath),
      TE.map(content => {
        const lines = content.split('\n');

        if (lines.length < 3) {
          return { filename, status: 'no_third_line' as const };
        }

        const thirdLine = lines[2];
        if (thirdLine.trim() === 'TITLE:' || thirdLine === 'TITLE: ') {
          return { filename, status: 'empty_title' as const };
        }

        return { filename, status: 'valid' as const };
      })
    );
  };

  const saveLogFile = (
    logPath: FilePath,
    files: string[]
  ): TE.TaskEither<string, void> =>
    fs.writeFile(logPath, files.join('\n') + '\n');

  return (
    srcPath: FilePath,
    logPath: FilePath
  ): TE.TaskEither<string, CheckTitlesResult> =>
    pipe(
      fs.readDirectory(srcPath),
      TE.map(files => files.filter(f => f.endsWith('.txt'))),
      TE.chain(files =>
        pipe(
          files,
          A.traverse(TE.ApplicativePar)(filename => checkFile(srcPath, filename)),
          TE.chain(results => {
            const validFiles = results
              .filter(r => r.status === 'valid')
              .map(r => r.filename);
            const emptyTitleFiles = results
              .filter(r => r.status === 'empty_title')
              .map(r => r.filename);
            const noThirdLineFiles = results
              .filter(r => r.status === 'no_third_line')
              .map(r => r.filename);

            const allEmptyTitles = [...emptyTitleFiles, ...noThirdLineFiles];

            return pipe(
              saveLogFile(logPath, allEmptyTitles),
              TE.map(() => ({
                validFiles,
                emptyTitleFiles,
                noThirdLineFiles
              }))
            );
          })
        )
      )
    );
};