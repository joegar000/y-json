import { autorun } from "mobx";
import * as Y from "yjs";

import { bindArray, bindMap, type YJSON } from "../index.ts";
import { mobxify } from "../mobx.ts";

function sync(source: Y.Doc, target: Y.Doc) {
  Y.applyUpdate(target, Y.encodeStateAsUpdate(source));
}

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

  test("reacts selectively to remote map changes", () => {
    type Value = { name: string; active: boolean };
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();
    const sourceYMap = sourceDoc.getMap<YJSON>("root");
    sourceYMap.set("name", "Ada");
    sync(sourceDoc, targetDoc);

    const map = mobxify(
      bindMap<Value>(targetDoc.getMap<YJSON>("root")),
    );
    const names: string[] = [];
    const keys: string[][] = [];
    const disposeName = autorun(() => names.push(map.name));
    const disposeKeys = autorun(() => keys.push(Object.keys(map)));

    sourceYMap.set("active", true);
    sync(sourceDoc, targetDoc);
    sourceYMap.set("name", "Grace");
    sync(sourceDoc, targetDoc);
    sourceYMap.delete("active");
    sync(sourceDoc, targetDoc);
    disposeName();
    disposeKeys();

    expect(names).toEqual(["Ada", "Grace"]);
    expect(keys).toEqual([["name"], ["name", "active"], ["name"]]);
  });

  test("reacts selectively to remote array changes", () => {
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();
    const sourceYArray = sourceDoc.getArray<YJSON>("root");
    sourceYArray.insert(0, [1, 2]);
    sync(sourceDoc, targetDoc);

    const array = mobxify(
      bindArray<number>(targetDoc.getArray<YJSON>("root")),
    );
    const firstValues: number[] = [];
    const lengths: number[] = [];
    const disposeFirst = autorun(() => firstValues.push(array[0]));
    const disposeLength = autorun(() => lengths.push(array.length));

    sourceYArray.delete(1, 1);
    sourceYArray.insert(1, [3]);
    sync(sourceDoc, targetDoc);
    sourceYArray.delete(0, 1);
    sourceYArray.insert(0, [2]);
    sync(sourceDoc, targetDoc);
    sourceYArray.push([4]);
    sync(sourceDoc, targetDoc);
    disposeFirst();
    disposeLength();

    expect(firstValues).toEqual([1, 2]);
    expect(lengths).toEqual([2, 3]);
  });

  test("reacts to remote nested map changes", () => {
    type Value = { profile: { name: string } };
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();
    const sourceMap = bindMap<Value>(sourceDoc.getMap<YJSON>("root"));
    sourceMap.profile = { name: "Ada" };
    sync(sourceDoc, targetDoc);

    const map = mobxify(
      bindMap<Value>(targetDoc.getMap<YJSON>("root")),
    );
    const names: string[] = [];
    const dispose = autorun(() => names.push(map.profile.name));

    sourceMap.profile.name = "Grace";
    sync(sourceDoc, targetDoc);
    dispose();

    expect(names).toEqual(["Ada", "Grace"]);
  });
});
