---
id: typed-sum
title: Sum an array of numbers
type: code-ts
skills: [prog.types]
level: 3
---

# --description--

TypeScript lets you describe what a function accepts and returns. A typed `sum` makes it impossible to pass a
list of strings by mistake.

# --instructions--

Complete `sum` so it returns the total of `values`. An empty array sums to `0`.

# --hints--

`sum([1, 2, 3])` should return `6`.

```js
assert.strictEqual(sum([1, 2, 3]), 6)
```

`sum([])` should return `0`.

```js
assert.strictEqual(sum([]), 0)
```

`sum` should declare its parameter as `number[]`.

```js
assert.match(code, /values\s*:\s*(number\[\]|Array<number>)/)
```

# --seed--

```ts
function sum(values) {
  // your code here
}
```

# --solutions--

```ts
function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
```
