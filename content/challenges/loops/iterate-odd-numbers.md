---
id: iterate-odd-numbers
title: Iterate odd numbers with a for loop
type: code-js
skills: [prog.loops]
level: 3
---

# --description--

A `for` loop does not have to step by one. Changing the final expression changes the step:

```js
for (let i = 0; i < 10; i += 2) {
  // 0, 2, 4, 6, 8
}
```

# --instructions--

Push the odd numbers from 1 through 9 into `odds` using a `for` loop.

# --hints--

You should use a `for` loop.

```js
assert.match(code, /for\s*\(/)
```

`odds` should equal `[1, 3, 5, 7, 9]`.

```js
assert.deepEqual(odds, [1, 3, 5, 7, 9])
```

# --seed--

```js
const odds = []

// Only change code below this line
```

# --solutions--

```js
const odds = []

// Only change code below this line
for (let i = 1; i < 10; i += 2) {
  odds.push(i)
}
```
