import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';

const RfcIdCodec = t.string;

export type RfcId = t.TypeOf<typeof RfcIdCodec>;

export const RfcId = {
  decode: (value: unknown): E.Either<string, RfcId> =>
    pipe(
      RfcIdCodec.decode(value),
      E.mapLeft(() => 'Invalid RFC ID format')
    ),

  fromString: (value: string): E.Either<string, RfcId> => {
    if (!value.trim()) {
      return E.left('RFC ID cannot be empty');
    }
    return E.right(value);
  },

  toNumber: (id: RfcId): E.Either<string, number> => {
    const num = parseInt(id, 10);
    return isNaN(num) ? E.left('RFC ID is not a valid number') : E.right(num);
  },

  toString: (id: RfcId): string => id,

  compare: (a: RfcId, b: RfcId): number => {
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    return aNum - bNum;
  }
};