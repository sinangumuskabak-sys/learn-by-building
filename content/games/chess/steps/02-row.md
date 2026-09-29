---
title: One row of squares
title_tr: Bir sıra kare
skills: [game.canvas, prog.loops]
---

# --goal--

A chess board is 8 × 8 squares of 56 pixels. We name the sizes, then draw the top row: 8 squares side by side,
light and dark in turn, using a `for` loop.

# --goal-tr--

Satranç tahtası 8 × 8 kareden oluşur. Her kare 56 piksel olsun. Önce bu ölçülere **ad** vereceğiz, sonra tahtanın
**en üst sırasını** çizeceğiz: yan yana 8 kare, bir açık bir koyu.

8 kareyi tek tek yazmak yerine bir **döngü** kullanacağız: "şunu 8 kez yap, her seferinde bir kare sağa kay".

# --code--

```js
const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages

  for (let c = 0; c < 8; c++) {
    const x = LEFT + c * SQ
    const y = TOP
    ctx.fillStyle = c % 2 === 0 ? '#e7d8b8' : '#b58863'
    ctx.fillRect(x, y, SQ, SQ)
  }
```

# --meaning--

- `SQ` is the size of a square; `LEFT` and `TOP` leave a margin (the top one will hold messages).
- `for (let c = 0; c < 8; c++)` counts `c` from 0 to 7: the column.
- `x = LEFT + c * SQ` moves each square 56 pixels further right.
- `c % 2` is the remainder after dividing by 2: 0 for even columns, 1 for odd ones. `a ? b : c` picks `b` if `a` is
  true, else `c`: so the colors alternate.

# --meaning-tr--

- `const SQ = 56` → bir karenin eni ve boyu (square). `LEFT = 16` tahtanın soldan, `TOP = 56` üstten boşluğu; üstteki
  boşluğa ileride mesajlar yazacağız. `//` sonrası **yorum**: bilgisayar okumaz.
- `for (let c = 0; c < 8; c++) {` → **döngü**: `c`'yi 0'dan başlatır, `c < 8` doğru olduğu sürece içeriyi yapar ve
  her turdan sonra `c++` ile 1 artırır. Yani `c` sırayla 0, 1, 2, ... 7 olur: **sütun numarası**.
- `const x = LEFT + c * SQ` → karenin soldan uzaklığı: `c` bir artınca kare 56 piksel sağa kayar.
- `const y = TOP` → bu sıranın bütün kareleri aynı yükseklikte.
- `c % 2` → `%` **bölümden kalan**: `c` çiftse 0, tekse 1.
- `koşul ? a : b` → "koşul doğruysa `a`, değilse `b`". Çift sütunlar açık (`'#e7d8b8'`), tekler koyu (`'#b58863'`).
- `ctx.fillRect(x, y, SQ, SQ)` → o sütunun karesini boyar.

# --task--

1. Under `const ctx = ...` leave an empty line and write the three sizes.
2. In `draw`, after the background, leave an empty line and write the loop. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altında bir boş satır bırakıp üç ölçü satırını yaz.
2. `draw` fonksiyonunun içinde, arka planı boyayan `ctx.fillRect(0, 0, ...)` satırının altına bir boş satır bırak ve
   döngüyü yaz (fonksiyonun kapanan `}`'inden **önce**).
3. **Çalıştır**: üstte yan yana 8 kareden oluşan bir şerit görmelisin.

# --predict--

Which color is the leftmost square?
- [x] Light
  For `c = 0` the remainder `0 % 2` is 0, so the condition is true and the first color is used.
- [ ] Dark
- [ ] Both, one on top of the other

# --predict-tr--

En soldaki kare hangi renk olacak?
- [x] Açık
  `c = 0` için `0 % 2` = 0; koşul doğru, yani ilk renk seçilir.
- [ ] Koyu
- [ ] İkisi üst üste

# --try--

Change `c < 8` to `c < 3` and run: only three squares. Put 8 back.

# --try-tr--

`c < 8` yerine `c < 3` yaz ve çalıştır: yalnız üç kare çizilir. Sonra 8'e geri al.

# --tests--

The top row should have 8 squares of 56 pixels, light and dark in turn.
tr: Üst sırada 56 piksellik 8 kare olmalı, bir açık bir koyu.

```js
const light = $.rects('#e7d8b8')
const dark = $.rects('#b58863')
assert.deepEqual(light.map((r) => r.x), [16, 128, 240, 352])
assert.deepEqual(dark.map((r) => r.x), [72, 184, 296, 408])
for (const r of [...light, ...dark]) assert.deepEqual([r.y, r.w, r.h], [56, 56, 56])
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let c = 0; c < 8; c++) {
    const x = LEFT + c * SQ
    const y = TOP
    ctx.fillStyle = c % 2 === 0 ? '#e7d8b8' : '#b58863'
    ctx.fillRect(x, y, SQ, SQ)
  }
}

draw()
```
