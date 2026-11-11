import * as Y from "yjs";

import { $Y, bindArray, type JSON, type YJSON } from "../index.ts";

function createBoundArray<T extends JSON>(values: YJSON[]) {
  const yArray = new Y.Doc().getArray<YJSON>("root");
  yArray.insert(0, values);
  return { array: bindArray<T>(yArray), yArray };
}

describe("bindArray", () => {
  test("reads, replaces, and appends values by index", () => {
    type Value = number | { label: string };
    const { array, yArray } = createBoundArray<Value>([1, 2]);
    const writableArray: Value[] = array;

    writableArray[1] = { label: "two" };
    writableArray[2] = 3;

    const value = array[1];
    if (typeof value === "number") throw new TypeError("Expected an object");
    expect(value.label).toBe("two");
    expect([...array]).toEqual([1, { label: "two" }, 3]);
    expect(yArray.toJSON()).toEqual([1, { label: "two" }, 3]);
  });

  test("supports adding and removing values at both ends", () => {
    const { array, yArray } = createBoundArray<number>([1, 2]);

    expect(array.push(3)).toBe(3);
    expect(array.unshift(0)).toBe(4);
    expect(array.pop()).toBe(3);
    expect(array.shift()).toBe(0);

    expect([...array]).toEqual([1, 2]);
    expect(yArray.toJSON()).toEqual([1, 2]);
  });

  test("splices values", () => {
    const { array, yArray } = createBoundArray<number | string>([1, 2, 3, 4]);

    const removed = array.splice(1, 2, "two");

    expect(removed).toEqual([2, 3]);
    expect([...array]).toEqual([1, "two", 4]);
    expect(yArray.toJSON()).toEqual([1, "two", 4]);
  });

  test("reverses, sorts, and fills values", () => {
    const { array, yArray } = createBoundArray<number>([3, 1, 2]);

    expect(array.reverse()).toBe(array);
    expect([...array]).toEqual([2, 1, 3]);
    expect(yArray.toJSON()).toEqual([2, 1, 3]);

    expect(array.sort((left, right) => left - right)).toBe(array);
    expect([...array]).toEqual([1, 2, 3]);
    expect(yArray.toJSON()).toEqual([1, 2, 3]);

    expect(array.fill(0, 1)).toBe(array);
    expect([...array]).toEqual([1, 0, 0]);
    expect(yArray.toJSON()).toEqual([1, 0, 0]);
  });

  test("copies values within the array", () => {
    const { array, yArray } = createBoundArray<number>([1, 2, 3, 4]);

    expect(array.copyWithin(1, 2)).toBe(array);
    expect([...array]).toEqual([1, 3, 4, 4]);
    expect(yArray.toJSON()).toEqual([1, 3, 4, 4]);
  });

  test("allows truncation but rejects sparse positions", () => {
    const { array, yArray } = createBoundArray<number>([1, 2, 3]);

    array.length = 2;

    expect([...array]).toEqual([1, 2]);
    expect(yArray.toJSON()).toEqual([1, 2]);
    expect(() => {
      array.length = 3;
    }).toThrow(RangeError);
    expect(() => {
      array[3] = 4;
    }).toThrow(RangeError);
    expect(yArray.toJSON()).toEqual([1, 2]);
  });

  test("exposes its keys and underlying Y.Array", () => {
    const { array, yArray } = createBoundArray<number>([1, 2]);

    expect(Object.keys(array)).toEqual(["0", "1"]);
    expect(array[$Y]).toBe(yArray);
    expect(yArray.toJSON()).toEqual([1, 2]);
  });
});
