#!/usr/bin/env node

import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { createNodeFileSystemAdapter } from '../../infrastructure/adapters/NodeFileSystemAdapter';
import { createSortRfcNumbersUseCase } from '../../application/useCases/SortRfcNumbersUseCase';
import { FilePath } from '../../domain/valueObjects/FilePath';

const LOG_PATH = './log/log.text';
const SORTED_LOG_PATH = './log/log_sorted.text';

const main = async (): Promise<void> => {
  const fs = createNodeFileSystemAdapter();
  const sortRfcNumbers = createSortRfcNumbersUseCase(fs);

  const inputPathResult = FilePath.create(LOG_PATH);
  if (E.isLeft(inputPathResult)) {
    console.error('Invalid input file path');
    process.exit(1);
  }
  const inputPath = inputPathResult.right;

  const outputPathResult = FilePath.create(SORTED_LOG_PATH);
  if (E.isLeft(outputPathResult)) {
    console.error('Invalid output file path');
    process.exit(1);
  }
  const outputPath = outputPathResult.right;

  const result = await pipe(
    sortRfcNumbers(inputPath, outputPath),
    TE.mapLeft(error => {
      console.error(`Error: ${error}`);
      process.exit(1);
    })
  )();

  if (E.isRight(result)) {
    const { totalCount, firstFive, lastFive } = result.right;

    console.log(`元のファイル: ${totalCount}個のRFC番号`);
    console.log(`ソート済みファイル: ${FilePath.toString(outputPath)}`);
    console.log(`最初の5個: ${firstFive.join(', ')}`);
    console.log(`最後の5個: ${lastFive.join(', ')}`);
  }
};

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}