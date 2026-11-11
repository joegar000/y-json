import { autorun } from "mobx";
import * as Y from "yjs";

import { bindArray, bindMap, mobxify, type YJSON } from "../index.ts";

describe("mobxify", () => {
  test("returns primitives and ordinary objects unchanged", () => {
    const object = { name: "Ada" };

    expect(mobxify(1)).toBe(1);
    expect(mobxify(object)).toBe(object);
  });

  test("returns the same wrapper for repeated calls", () => {
    const map = bindMap(new Y.Doc().getMap<YJSON>("root"));

    expect(mobxify(map)).toBe(mobxify(map));
  });

  test("reacts to map property changes", () => {
    const yMap = new Y.Doc().getMap<YJSON>("root");
    yMap.set("name", "Ada");
    const map = mobxify(bindMap<{ name: string }>(yMap));
    const names: string[] = [];
    const dispose = autorun(() => names.push(map.name));

    yMap.set("name", "Grace");
    dispose();

    expect(names).toEqual(["Ada", "Grace"]);
  });

  test("reacts when map keys change", () => {
    const yMap = new Y.Doc().getMap<YJSON>("root");
    const map = mobxify(bindMap(yMap));
    const keys: string[][] = [];
    const dispose = autorun(() => keys.push(Object.keys(map)));

    map.active = true;
    dispose();

    expect(keys).toEqual([[], ["active"]]);
  });

  test("reacts to array values and length", () => {
    const yArray = new Y.Doc().getArray<YJSON>("root");
    yArray.insert(0, [1]);
    const array = mobxify(bindArray<number>(yArray));
    const snapshots: Array<[number, number]> = [];
    const dispose = autorun(() => snapshots.push([array.length, array[0]]));

    array[0] = 2;
    array.push(3);
    dispose();

    expect(snapshots).toEqual([
      [1, 1],
      [1, 2],
      [2, 2],
    ]);
  });

  test("mobxifies nested values", () => {
    type Value = { profile: { name: string } };
    const map = bindMap<Value>(new Y.Doc().getMap<YJSON>("root"));
    map.profile = { name: "Ada" };
    const mobxMap = mobxify(map);

    expect(mobxMap.profile).toBe(mobxMap.profile);
    expect(mobxMap.profile.name).toBe("Ada");
  });
});
