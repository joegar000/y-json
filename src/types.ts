import * as Y from 'yjs';

export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [key: string]: JSON };
export type JSONArray = JSON[];
export type JSON = JSONPrimitive | JSONObject | JSONArray;
export type YJSON = JSONPrimitive | Y.Map<YJSON> | Y.Array<YJSON>;

export type BoundMap<O extends JSONObject = JSONObject> = O;
export type BoundArray<O extends JSON = JSON> = O[];
export type BoundJSON<J extends JSON> = J;


export type BindContext = {
  cache: WeakMap<Y.AbstractType<any>, JSON>;
  jsFromY(y: unknown): JSON;
  yFromJS(value: unknown): YJSON;
  transact(y: Y.AbstractType<any>, operation: () => void): void;
}
