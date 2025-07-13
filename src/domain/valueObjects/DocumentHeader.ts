import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';

const DocumentHeaderCodec = t.type({
  uuid: t.string,
  createdAt: t.string,
  title: t.string,
  tags: t.string,
  category: t.string,
  score: t.number
});

export type DocumentHeader = t.TypeOf<typeof DocumentHeaderCodec>;

export const DocumentHeader = {
  create: (params: {
    uuid: string;
    createdAt: string;
    title: string;
    tags: string;
    category: string;
    score: number;
  }): E.Either<string, DocumentHeader> =>
    pipe(
      DocumentHeaderCodec.decode(params),
      E.mapLeft(() => 'Invalid document header format')
    ),

  createDefault: (uuid: string, createdAt: string): DocumentHeader => ({
    uuid,
    createdAt,
    title: 'rfc',
    tags: 'rfc',
    category: 'RFC',
    score: 0.0
  }),

  toString: (header: DocumentHeader): string =>
    `UUID: ${header.uuid}
CREATED_AT: ${header.createdAt}
TITLE: ${header.title}
TAGS: ${header.tags}
CATEGORY: ${header.category}
SCORE: ${header.score}
---
`,

  parse: (content: string): E.Either<string, DocumentHeader> => {
    const lines = content.split('\n');
    const headerData: any = {};

    for (const line of lines) {
      if (line === '---') break;
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        switch (key) {
          case 'UUID':
            headerData.uuid = value;
            break;
          case 'CREATED_AT':
            headerData.createdAt = value;
            break;
          case 'TITLE':
            headerData.title = value;
            break;
          case 'TAGS':
            headerData.tags = value;
            break;
          case 'CATEGORY':
            headerData.category = value;
            break;
          case 'SCORE':
            headerData.score = parseFloat(value);
            break;
        }
      }
    }

    return pipe(
      DocumentHeaderCodec.decode(headerData),
      E.mapLeft(() => 'Failed to parse document header')
    );
  }
};