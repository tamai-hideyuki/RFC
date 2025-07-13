#!/usr/bin/env node

import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { createNodeFileSystemAdapter } from '../../infrastructure/adapters/NodeFileSystemAdapter';
import { createAddHeadersUseCase } from '../../application/useCases/AddHeadersUseCase';
import { FilePath } from '../../domain/valueObjects/FilePath';

const RFC_DIR = './RFC';

const main = async (): Promise<void> => {
  const fs = createNodeFileSystemAdapter();
  const addHeaders = createAddHeadersUseCase(fs);

  const dirPathResult = FilePath.create(RFC_DIR);
  if (E.isLeft(dirPathResult)) {
    console.error('Invalid directory path');
    process.exit(1);
  }
  const dirPath = dirPathResult.right;

  const result = await pipe(
    addHeaders(dirPath),
    TE.mapLeft(error => {
      console.error(`Error: ${error}`);
      process.exit(1);
    })
  )();

  if (E.isRight(result)) {
    const { processed, skipped } = result.right;

    processed.forEach(filename => {
      console.log(`Prepended header: ${filename}`);
    });

    skipped.forEach(filename => {
      console.log(`Skipped (already has header): ${filename}`);
    });
  }
};

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}