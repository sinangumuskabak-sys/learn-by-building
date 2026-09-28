---
id: iterate-odd-numbers
title: Iterate odd numbers with a for loop
title_tr: for döngüsüyle tek sayıları dolaş
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

# --description-tr--

**Döngü**, aynı kodu birçok kez çalıştırmanın yoludur. `for` döngüsünün parantezinde üç parça vardır:

```js
for (let i = 0; i < 10; i += 2) {
  // burası her turda çalışır: i sırayla 0, 2, 4, 6, 8 olur
}
```

1. `let i = 0` → **başlangıç**: sayacı 0'dan başlat.
2. `i < 10` → **koşul**: bu doğru olduğu sürece devam et.
3. `i += 2` → **adım**: her turun sonunda sayacı 2 artır.

Adım her zaman 1 olmak zorunda değil; `i += 2` sayacı ikişer ikişer ilerletir.

Bir diziye (listeye) eleman eklemek için `push` kullanılır: `odds.push(3)` listenin sonuna 3 ekler.

# --instructions--

Push the odd numbers from 1 through 9 into `odds` using a `for` loop.

# --instructions-tr--

`// Only change code below this line` satırının **altına** bir `for` döngüsü yaz:

1. Sayaç **1**'den başlasın (1 ilk tek sayı).
2. Sayaç 10'dan küçük olduğu sürece dönsün.
3. Her turda sayacı **2** artır (1, 3, 5, 7, 9).
4. Döngünün içinde sayacı `odds.push(i)` ile listeye ekle.

Sonunda `odds` listesi `[1, 3, 5, 7, 9]` olmalı.

# --hints--

You should use a `for` loop.
tr: Bir `for` döngüsü kullanmalısın.

```js
assert.match(code, /for\s*\(/)
```

`odds` should equal `[1, 3, 5, 7, 9]`.
tr: `odds` şuna eşit olmalı: `[1, 3, 5, 7, 9]`.

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
