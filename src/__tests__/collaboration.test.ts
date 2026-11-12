import * as Y from "yjs";

import { bindArray, bindMap, getY, type YJSON } from "../index.ts";

function sync(source: Y.Doc, target: Y.Doc) {
  Y.applyUpdate(target, Y.encodeStateAsUpdate(source));
}

function exchangeUpdates(left: Y.Doc, right: Y.Doc) {
  const leftUpdate = Y.encodeStateAsUpdate(left);
  const rightUpdate = Y.encodeStateAsUpdate(right);
  Y.applyUpdate(left, rightUpdate);
  Y.applyUpdate(right, leftUpdate);
}

describe("Yjs collaboration", () => {
  test("reflects remote map updates and nested values", () => {
    type Value = {
      name: string;
      profile: { active: boolean };
    };
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();
    const sourceYMap = sourceDoc.getMap<YJSON>("root");
    sourceYMap.set("name", "Ada");
    sourceYMap.set("obsolete", true);
    sync(sourceDoc, targetDoc);

    const targetYMap = targetDoc.getMap<YJSON>("root");
    const map = bindMap<Value>(targetYMap);
    const sourceMap = bindMap<Value>(sourceYMap);

    sourceMap.name = "Grace";
    sourceMap.profile = { active: true };
    sourceYMap.delete("obsolete");
    sync(sourceDoc, targetDoc);

    const profile = map.profile;
    expect(map.name).toBe("Grace");
    expect(profile.active).toBe(true);
    expect("obsolete" in map).toBe(false);
    expect(Object.keys(map)).toEqual(["name", "profile"]);
    expect(map.profile).toBe(profile);
    expect(getY(profile)).toBe(targetYMap.get("profile"));
    expect(bindMap(targetYMap)).toBe(map);
    expect(targetYMap.toJSON()).toEqual({
      name: "Grace",
      profile: { active: true },
    });
  });

  test("reflects remote array insertions, replacements, and deletions", () => {
    const sourceDoc = new Y.Doc();
    const targetDoc = new Y.Doc();
    const sourceYArray = sourceDoc.getArray<YJSON>("root");
    sourceYArray.insert(0, [1, 2, 3]);
    sync(sourceDoc, targetDoc);

    const targetYArray = targetDoc.getArray<YJSON>("root");
    const array = bindArray<number | string>(targetYArray);

    sourceYArray.delete(1, 1);
    sourceYArray.insert(1, ["two"]);
    sourceYArray.push([4]);
    sync(sourceDoc, targetDoc);

    expect(array.length).toBe(4);
    expect([...array]).toEqual([1, "two", 3, 4]);
    expect(Object.keys(array)).toEqual(["0", "1", "2", "3"]);
    expect(bindArray(targetYArray)).toBe(array);
    expect(getY(array)).toBe(targetYArray);
    expect(targetYArray.toJSON()).toEqual([1, "two", 3, 4]);
  });

  test("converges after concurrent map and array changes", () => {
    const leftDoc = new Y.Doc();
    const rightDoc = new Y.Doc();
    const leftMap = bindMap(leftDoc.getMap<YJSON>("map"));
    const rightMap = bindMap(rightDoc.getMap<YJSON>("map"));
    const leftArray = bindArray<string>(leftDoc.getArray<YJSON>("array"));
    const rightArray = bindArray<string>(rightDoc.getArray<YJSON>("array"));

    leftMap.left = 1;
    rightMap.right = 2;
    leftArray.push("left");
    rightArray.push("right");
    exchangeUpdates(leftDoc, rightDoc);

    expect(leftMap).toEqual({ left: 1, right: 2 });
    expect(rightMap).toEqual({ left: 1, right: 2 });
    expect([...leftArray]).toEqual([...rightArray]);
    expect([...leftArray].sort()).toEqual(["left", "right"]);
    expect(getY(leftMap).toJSON()).toEqual(getY(rightMap).toJSON());
    expect(getY(leftArray).toJSON()).toEqual(getY(rightArray).toJSON());
  });
});
