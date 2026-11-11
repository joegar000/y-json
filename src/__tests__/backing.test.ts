import * as Y from "yjs";

import {
  bindArray,
  bindMap,
  getY,
  getYSafe,
  mobxify,
  type YJSON,
} from "../index.ts";

describe("Yjs backing values", () => {
  test("returns backing maps and arrays", () => {
    const yMap = new Y.Doc().getMap<YJSON>("map");
    const yArray = new Y.Doc().getArray<YJSON>("array");
    const map = bindMap(yMap);
    const array = bindArray(yArray);

    const mapBacking: Y.Map<YJSON> = getY(map);
    const arrayBacking: Y.Array<YJSON> = getY(array);

    expect(mapBacking).toBe(yMap);
    expect(arrayBacking).toBe(yArray);
    expect(getYSafe(map)).toBe(yMap);
    expect(getYSafe(array)).toBe(yArray);
  });

  test("recognizes nested and MobX wrappers", () => {
    type Value = { profile: { name: string } };
    const yMap = new Y.Doc().getMap<YJSON>("root");
    const map = bindMap<Value>(yMap);
    const writableMap: Value = map;
    writableMap.profile = { name: "Ada" };
    const mobxMap = mobxify(map);

    expect(getY(map.profile)).toBe(yMap.get("profile"));
    expect(getY(mobxMap)).toBe(yMap);
    expect(getY(mobxMap.profile)).toBe(yMap.get("profile"));
  });

  test.each([null, 1, "value", {}, [], new Y.Map()])(
    "rejects unbound value %#",
    (value) => {
      expect(getYSafe(value)).toBeNull();
      expect(() => getY(value)).toThrow(
        new TypeError("Value is not bound to a Yjs type"),
      );
    },
  );
});
