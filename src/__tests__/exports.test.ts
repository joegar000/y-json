import * as core from "../index.ts";
import * as mobx from "../mobx.ts";

// @ts-expect-error BindContext is an implementation detail.
import type { BindContext } from "../index.ts";
// @ts-expect-error _bindArray is an implementation detail.
import type { _bindArray } from "../index.ts";
// @ts-expect-error _bindMap is an implementation detail.
import type { _bindMap } from "../index.ts";

describe("public entry points", () => {
  test("exports only the core runtime API from the root", () => {
    expect(Object.keys(core).sort()).toEqual([
      "bindArray",
      "bindMap",
      "getY",
      "getYSafe",
    ]);
  });

  test("exports only mobxify from the MobX integration", () => {
    expect(Object.keys(mobx)).toEqual(["mobxify"]);
  });
});
