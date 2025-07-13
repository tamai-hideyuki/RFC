import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { DocumentHeader } from '../valueObjects/DocumentHeader';
import { FilePath } from '../valueObjects/FilePath';

export interface RfcDocument {
  readonly path: FilePath;
  readonly header: DocumentHeader | null;
  readonly content: string;
}

export const RfcDocument = {
  create: (
    path: FilePath,
    content: string
  ): E.Either<string, RfcDocument> => {
    const hasHeader = content.startsWith('UUID:');

    if (hasHeader) {
      const headerEndIndex = content.indexOf('---\n');
      if (headerEndIndex === -1) {
        return E.left('Invalid document format: header separator not found');
      }

      const headerStr = content.substring(0, headerEndIndex + 3);
      const bodyContent = content.substring(headerEndIndex + 4);

      return pipe(
        DocumentHeader.parse(headerStr),
        E.map(header => ({
          path,
          header,
          content: bodyContent
        }))
      );
    }

    return E.right({
      path,
      header: null,
      content
    });
  },

  addHeader: (
    document: RfcDocument,
    header: DocumentHeader
  ): RfcDocument => ({
    ...document,
    header
  }),

  toFileContent: (document: RfcDocument): string => {
    if (document.header) {
      return DocumentHeader.toString(document.header) + document.content;
    }
    return document.content;
  },

  hasHeader: (document: RfcDocument): boolean =>
    document.header !== null,

  hasEmptyTitle: (document: RfcDocument): boolean => {
    if (!document.header) return false;
    return document.header.title === 'rfc' ||
           document.header.title === '' ||
           document.header.title === 'TITLE:';
  }
};