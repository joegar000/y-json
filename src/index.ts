import * as Y from "yjs";
import { isJSONObject, isJSONArray, isJSONValue } from "es-toolkit";
import type {
  BindContext,
  BoundArray,
  BoundMap,
  JSON,
  JSONObject,
  JSONPrimitive,
  YJSON,
} from "./types";
import { bindMap as bindMapWithContext } from "./map";
import { bindArray as bindArrayWithContext } from "./array";

const context: BindContext = {
  cache: new WeakMap(),
  yFromJS(val) {
    if (!isJSONValue(val))
      throw TypeError("Cannot convert non-json value into a yjs object");

    if (isJSONArray(val)) {
      const yArray = new Y.Array<YJSON>();
      yArray.insert(0, val.map(context.yFromJS));
      return yArray;
    }

    if (isJSONObject(val)) {
      const yMap = new Y.Map<YJSON>();
      for (const [key, value] of Object.entries(val)) {
        yMap.set(key, context.yFromJS(value));
      }
      return yMap;
    }

    return val;
  },
  jsFromY(value) {
    if (value instanceof Y.Map) return bindMapWithContext(value, context);

    if (value instanceof Y.Array) return bindArrayWithContext(value, context);

    return value as JSONPrimitive;
  },
  transact(y, operation) {
    if (y.doc) y.doc.transact(operation);
    else operation();
  },
};

export function bindMap<R extends JSONObject = JSONObject>(
  y: Y.Map<YJSON>,
): BoundMap<R> {
  return bindMapWithContext<R>(y, context);
}

export function bindArray<R extends JSON = JSON>(
  y: Y.Array<YJSON>,
): BoundArray<R> {
  return bindArrayWithContext<R>(y, context);
}

export {
  bindMapWithContext as _bindMap,
  bindArrayWithContext as _bindArray,
};
export { $Y } from "./symbol.ts";
export type * from "./types.ts";
export * from "./mobxify.ts";
