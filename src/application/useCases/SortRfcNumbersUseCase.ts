import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { RfcId } from '../../domain/valueObjects/RfcId';
import { FilePath } from '../../domain/valueObjects/FilePath';
import { FileSystemPort } from './AddHeadersUseCase';

export interface SortRfcNumbersResult {
  totalCount: number;
  sortedNumbers: string[];
  firstFive: string[];
  lastFive: string[];
}

export const createSortRfcNumbersUseCase = (fs: FileSystemPort) => {
  const parseRfcNumbers = (content: string): E.Either<string, RfcId[]> => {
    const lines = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().replace('.text', ''));

    return pipe(
      lines,
      A.traverse(E.Applicative)(RfcId.fromString)
    );
  };

  const sortRfcIds = (ids: RfcId[]): RfcId[] =>
    [...ids].sort(RfcId.compare);

  const formatOutput = (ids: RfcId[]): string =>
    ids.map(id => `${RfcId.toString(id)}.text`).join('\n') + '\n';

  return (
    inputPath: FilePath,
    outputPath: FilePath
  ): TE.TaskEither<string, SortRfcNumbersResult> =>
    pipe(
      fs.readFile(inputPath),
      TE.chain(content =>
        pipe(
          parseRfcNumbers(content),
          TE.fromEither
        )
      ),
      TE.map(sortRfcIds),
      TE.chain(sortedIds => {
        const outputContent = formatOutput(sortedIds);
        const sortedStrings = sortedIds.map(RfcId.toString);

        return pipe(
          fs.writeFile(outputPath, outputContent),
          TE.map(() => ({
            totalCount: sortedIds.length,
            sortedNumbers: sortedStrings,
            firstFive: sortedStrings.slice(0, 5),
            lastFive: sortedStrings.slice(-5)
          }))
        );
      })
    );
};