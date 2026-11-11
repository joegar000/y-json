import * as Y from "yjs";

import { $Y } from "./symbol.ts";
import type { YJSON } from "./types.ts";

type BackingY = Y.Map<YJSON> | Y.Array<YJSON>;

export function getY(value: readonly unknown[]): Y.Array<YJSON>;
export function getY(value: object): Y.Map<YJSON>;
export function getY(value: unknown): BackingY;
export function getY(value: unknown): BackingY {
  const y = getYSafe(value);
  if (y === null) throw new TypeError("Value is not bound to a Yjs type");
  return y;
}

export function getYSafe(value: readonly unknown[]): Y.Array<YJSON> | null;
export function getYSafe(value: object): Y.Map<YJSON> | null;
export function getYSafe(value: unknown): BackingY | null;
export function getYSafe(value: unknown): BackingY | null {
  if (typeof value !== "object" || value === null) return null;

  try {
    if (!($Y in value)) return null;
    const y = Reflect.get(value, $Y);
    return y instanceof Y.Map || y instanceof Y.Array ? y : null;
  } catch {
    return null;
  }
}
