export function generateSimpleIdentifier() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomizeList<T>(list: T[]): T[] {
  return list
    .map((it) => ({
      value: it,
      order: getRandomInt(0, list.length),
    }))
    .sort((a, b) => (a.order > b.order ? 0 : -1))
    .map((it) => it.value);
}

export const distinct =
  <A extends Array<O>, O>(...keys: Array<keyof O>) =>
  (it: O, i: keyof A, a: A) =>
    a.findIndex((ait) =>
      typeof it === "object" && typeof it === "object" && it && keys.length > 0
        ? keys.every((key) => ait[key] === it[key])
        : ait === it,
    ) === i;
