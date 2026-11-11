import { jest } from "@jest/globals";
import * as Y from "yjs";

import { bindMap, getY, type YJSON } from "../index.ts";

describe("bindMap", () => {
  test("reads and writes JSON values", () => {
    type Value = {
      name: string;
      profile: { active: boolean };
    };
    const yMap = new Y.Doc().getMap<YJSON>("root");
    yMap.set("name", "Ada");
    const map = bindMap<Value>(yMap);

    expect(map.name).toBe("Ada");

    map.profile = { active: true };

    expect(map.profile.active).toBe(true);
    expect(yMap.toJSON()).toEqual({
      name: "Ada",
      profile: { active: true },
    });
  });

  test("deletes properties from the Y.Map", () => {
    const yMap = new Y.Doc().getMap<YJSON>("root");
    yMap.set("name", "Ada");
    const map = bindMap(yMap);

    delete map.name;

    expect("name" in map).toBe(false);
    expect(yMap.has("name")).toBe(false);
  });

  test("exposes keys and the backing Y.Map", () => {
    const yMap = new Y.Doc().getMap<YJSON>("root");
    yMap.set("name", "Ada");
    yMap.set("active", true);
    const map = bindMap(yMap);

    expect(Object.keys(map)).toEqual(["name", "active"]);
    expect(getY(map)).toBe(yMap);
  });

  test("rejects non-JSON values", () => {
    const map = bindMap(new Y.Doc().getMap<YJSON>("root"));

    expect(() => {
      Reflect.set(map, "callback", jest.fn());
    }).toThrow(TypeError);
  });
});
