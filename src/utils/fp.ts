import {
  dropLeftWhile,
  dropRight,
  takeLeftWhile,
  takeRight,
  reverse,
  dropLeft,
  takeLeft,
} from 'fp-ts/Array';

export { groupBy } from 'ramda';

export { range } from 'fp-ts/NonEmptyArray';
import { range } from 'fp-ts/NonEmptyArray';
export {
  takeLeftWhile,
  dropLeftWhile,
  dropRight,
  takeRight,
  reverse,
  takeLeft,
} from 'fp-ts/Array';

export function last<T>(xs: T[]) {
  return xs.slice(-1)[0];
}

export function splitRightWhile<T>(f: (x: T) => boolean, arr: T[]) {
  const count = takeLeftWhile(f)(reverse(arr)).length;
  return [dropRight(count)(arr), takeRight(count)(arr)];
}

export function splitEvery<T>(n: number, xs: T[]) {
  return range(0, Math.floor(xs.length / n)).map((i) =>
    takeLeft(n)(dropLeft(i * n)(xs)),
  );
}

// console.log('splitEvery(3, range(0, 11))', splitEvery(3, range(0, 3)));
