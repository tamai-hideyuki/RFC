import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { v4 as uuidv4 } from 'uuid';
import { RfcDocument } from '../../domain/entities/RfcDocument';
import { DocumentHeader } from '../../domain/valueObjects/DocumentHeader';
import { FilePath } from '../../domain/valueObjects/FilePath';

export interface FileSystemPort {
  readDirectory: (path: FilePath) => TE.TaskEither<string, string[]>;
  readFile: (path: FilePath) => TE.TaskEither<string, string>;
  writeFile: (path: FilePath, content: string) => TE.TaskEither<string, void>;
}

export interface AddHeadersResult {
  processed: string[];
  skipped: string[];
}

const getJSTDateTime = (): string => {
  const now = new Date();
  const jstOffset = 9 * 60;
  const localOffset = now.getTimezoneOffset();
  const jstTime = new Date(now.getTime() + (jstOffset + localOffset) * 60000);
  return jstTime.toISOString();
};

export const createAddHeadersUseCase = (fs: FileSystemPort) => {
  const processFile = (
    dirPath: FilePath,
    filename: string
  ): TE.TaskEither<string, { filename: string; status: 'processed' | 'skipped' }> => {
    const filePath = FilePath.join(dirPath, { _tag: 'FilePath', value: filename });

    return pipe(
      fs.readFile(filePath),
      TE.chain(content =>
        pipe(
          RfcDocument.create(filePath, content),
          TE.fromEither,
          TE.chain((document): TE.TaskEither<string, { filename: string; status: 'processed' | 'skipped' }> => {
            if (RfcDocument.hasHeader(document)) {
              return TE.right({ filename, status: 'skipped' as const });
            }

            const header = DocumentHeader.createDefault(
              uuidv4(),
              getJSTDateTime()
            );
            const updatedDocument = RfcDocument.addHeader(document, header);
            const newContent = RfcDocument.toFileContent(updatedDocument);

            return pipe(
              fs.writeFile(filePath, newContent),
              TE.map(() => ({ filename, status: 'processed' as const }))
            );
          })
        )
      )
    );
  };

  return (dirPath: FilePath): TE.TaskEither<string, AddHeadersResult> =>
    pipe(
      fs.readDirectory(dirPath),
      TE.map(files => files.filter(f => f.endsWith('.text'))),
      TE.chain(files =>
        pipe(
          files,
          A.traverse(TE.ApplicativePar)(filename => processFile(dirPath, filename)),
          TE.map(results => {
            const processed = results
              .filter(r => r.status === 'processed')
              .map(r => r.filename);
            const skipped = results
              .filter(r => r.status === 'skipped')
              .map(r => r.filename);
            return { processed, skipped };
          })
        )
      )
    );
};