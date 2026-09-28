---
id: read-off-by-one
title: Spot the off-by-one
title_tr: Bir eksik/bir fazla hatasını bul
type: read
skills: [prog.loops]
level: 2
---

# --description--

Read the function below without running it, then answer the questions.

# --description-tr--

Aşağıdaki fonksiyon, bir listenin **son `count` elemanını** döndürmek için yazılmış ama içinde küçük bir hata
var. Programcılar bu tür hataya **"off-by-one"** (bir eksik ya da bir fazla) der: döngü bir tur fazla ya da eksik döner.

Kodu çalıştırmadan oku, sonra soruları cevapla. İpucu: listenin sıra numaraları (index) **0'dan** başlar;
`['a', 'b', 'c']` listesinde `items[0]` = `'a'`, `items[2]` = `'c'`, `items[3]` ise **yoktur** (`undefined`).

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

# --questions-tr--

## `lastItems(['a', 'b', 'c'], 2)` ne döndürür?

- [ ] `['b', 'c']`
- [x] `['b', 'c', undefined]`
- [ ] `['a', 'b', 'c']`

## Hatayı hangi değişiklik düzeltir?

- [x] Koşul olarak `i < items.length` kullanmak
- [ ] `items.length - count - 1`'den başlamak
- [ ] `i++` yerine `i--` kullanmak
