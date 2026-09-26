---
id: read-off-by-one
title: Spot the off-by-one
type: read
skills: [prog.loops]
level: 2
---

# --description--

Read the function below without running it, then answer the questions.

# --seed--

```js
function lastItems(items, count) {
  const result = []
  for (let i = items.length - count; i <= items.length; i++) {
    result.push(items[i])
  }
  return result
}
```

# --questions--

## What does `lastItems(['a', 'b', 'c'], 2)` return?

- [ ] `['b', 'c']`
- [x] `['b', 'c', undefined]`
- [ ] `['a', 'b', 'c']`

## Which change fixes the bug?

- [x] Use `i < items.length` as the condition
- [ ] Start from `items.length - count - 1`
- [ ] Use `i--` instead of `i++`
