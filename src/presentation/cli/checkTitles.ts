#!/usr/bin/env node

import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { createNodeFileSystemAdapter, ensureDirectory } from '../../infrastructure/adapters/NodeFileSystemAdapter';
import { createCheckTitlesUseCase } from '../../application/useCases/CheckTitlesUseCase';
import { FilePath } from '../../domain/valueObjects/FilePath';

const SRC_DIR = './rfc_out';
const LOG_DIR = './log';
const LOG_FILE = 'empty_title_files.txt';

const main = async (): Promise<void> => {
  const fs = createNodeFileSystemAdapter();
  const checkTitles = createCheckTitlesUseCase(fs);

  const srcPathResult = FilePath.create(SRC_DIR);
  if (E.isLeft(srcPathResult)) {
    console.error('Invalid source directory path');
    process.exit(1);
  }
  const srcPath = srcPathResult.right;

  const logDirResult = FilePath.create(LOG_DIR);
  if (E.isLeft(logDirResult)) {
    console.error('Invalid log directory path');
    process.exit(1);
  }
  const logDir = logDirResult.right;

  const logPath = FilePath.join(logDir, { _tag: 'FilePath', value: LOG_FILE });

  await pipe(
    ensureDirectory(logDir),
    TE.chain(() => checkTitles(srcPath, logPath)),
    TE.mapLeft(error => {
      console.error(`Error: ${error}`);
      process.exit(1);
    }),
    TE.map(result => {
      const { validFiles, emptyTitleFiles, noThirdLineFiles } = result;

      noThirdLineFiles.forEach(filename => {
        console.log(`NG (no 3rd line): ${filename}`);
      });

      emptyTitleFiles.forEach(filename => {
        console.log(`NG (empty title): ${filename}`);
      });

      validFiles.forEach(filename => {
        console.log(`OK: ${filename}`);
      });

      console.log(`\nEmpty-title files logged to ${FilePath.toString(logPath)}`);
    })
  )();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}