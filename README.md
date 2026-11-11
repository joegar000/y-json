# y-json

JSON-like bindings for Yjs maps and arrays with MobX reactivity.

## Installation

```sh
npm install y-json yjs mobx
```

`yjs` and `mobx` are peer dependencies so the application and this library
operate on the same runtime instances.

## Usage

```ts
import * as Y from "yjs";
import { bindMap, type YJSON } from "y-json";

type Todo = {
  title: string;
  completed: boolean;
};

const doc = new Y.Doc();
const yTodo = doc.getMap<YJSON>("todo");
const todo = bindMap<Todo>(yTodo);

todo.title = "Write documentation";
todo.completed = false;

console.log(todo.title);
console.log(yTodo.toJSON());
```

Arrays expose familiar JavaScript array operations:

```ts
import * as Y from "yjs";
import { bindArray, type YJSON } from "y-json";

const doc = new Y.Doc();
const items = bindArray<number>(doc.getArray<YJSON>("items"));

items.push(1, 2, 3);
items.splice(1, 1, 4);
```

Use `mobxify` when reads should participate in MobX reactions:

```ts
import { autorun } from "mobx";
import { bindMap, mobxify, type YJSON } from "y-json";
import * as Y from "yjs";

const doc = new Y.Doc();
const state = mobxify(
  bindMap<{ count: number }>(doc.getMap<YJSON>("state")),
);

const dispose = autorun(() => console.log(state.count));
state.count = 1;
dispose();
```

Only JSON-compatible values are accepted. Assigning values such as functions,
symbols, or `undefined` throws a `TypeError`.

## API

- `bindMap(yMap)` creates a JSON-like object backed by a `Y.Map`.
- `bindArray(yArray)` creates an array-like object backed by a `Y.Array`.
- `mobxify(value)` adds MobX observation to a bound map or array.
- `$Y` accesses the underlying Yjs type from a bound value.

## Runtime support

The package is ESM-only and supports Node.js 22 or newer and modern bundlers.

## Development

```sh
npm test
npm run typecheck
npm run build
npm run check
```

`npm run check` also validates the contents and TypeScript resolution of the
package that would be published.
