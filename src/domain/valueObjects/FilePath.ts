import * as E from 'fp-ts/Either';

export interface FilePath {
  readonly _tag: 'FilePath';
  readonly value: string;
}

export const FilePath = {
  create: (value: string): E.Either<string, FilePath> => {
    if (!value.trim()) {
      return E.left('File path cannot be empty');
    }
    return E.right({ _tag: 'FilePath', value });
  },

  toString: (path: FilePath): string => path.value,

  join: (...paths: FilePath[]): FilePath => ({
    _tag: 'FilePath',
    value: paths.map(p => p.value).join('/')
  }),

  dirname: (path: FilePath): FilePath => {
    const parts = path.value.split('/');
    return {
      _tag: 'FilePath',
      value: parts.slice(0, -1).join('/') || '.'
    };
  },

  basename: (path: FilePath): string => {
    const parts = path.value.split('/');
    return parts[parts.length - 1];
  },

  extension: (path: FilePath): string => {
    const basename = FilePath.basename(path);
    const lastDot = basename.lastIndexOf('.');
    return lastDot === -1 ? '' : basename.slice(lastDot);
  }
};