---
title: A 10 by 10 sea
title_tr: 10'a 10 bir deniz
skills: [game.canvas, prog.loops]
---

# --goal--

Battleship is played on a sea of 10 by 10 squares. We draw the enemy's sea, where you will shoot: 100 blue squares with
thin gaps between them.

# --goal-tr--

Amiral Battı 10×10 karelik bir **denizde** oynanır. İlk adımda düşmanın denizini çiziyoruz; ateş edeceğin yer burası.
100 lacivert kare, aralarında ince boşluklarla.

Kareleri tek tek yazmak yerine iki **iç içe döngü** kullanacağız: dıştaki satırları, içteki sütunları gezer.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SEA = { x: 30, y: 50 }

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#1e3a8a'
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    ctx.fillRect(SEA.x + c * BIG + 1, SEA.y + r * BIG + 1, BIG - 2, BIG - 2)
  }
}
```

# --meaning--

- `N` is the size of the sea, `BIG` the size of one square, `SEA` the top-left corner of the sea.
- The outer loop counts the rows `r` from 0 to 9; for each row the inner loop counts the columns `c`.
- Each square is drawn 1 pixel in from its sides and 2 pixels smaller, which leaves thin gaps.

# --meaning-tr--

- `canvas`, `ctx` → sayfadaki canvas ve onun **2D çizim kalemi**.
- `const N = 10` → denizin boyu: 10 satır, 10 sütun.
- `const BIG = 36` → bir karenin kenarı, 36 piksel.
- `const SEA = { x: 30, y: 50 }` → denizin sol üst köşesi; bir **nesne**: `SEA.x` 30, `SEA.y` 50.
- İlk iki çizim satırı bütün alanı koyu laciverte boyar.
- `for (let r = 0; r < N; r++)` → **döngü**: `r` (row, satır) 0'dan başlar, 10'dan küçük olduğu sürece devam eder,
  her turda 1 artar (`++`). İçindeki `for (let c ...)` her satır için sütunları (column) gezer: 10 × 10 = 100 tur.
- `SEA.x + c * BIG` → `c`. sütunun sol kenarı; `SEA.y + r * BIG` → `r`. satırın üst kenarı.
- `+ 1` ve `BIG - 2` → kareyi 1 piksel içeriden ve 2 piksel küçük çizer: kareler arasında ince **boşluklar** kalır.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının **altına** yaz; boş satırları da aynen bırak. **Çalıştır**'a bas: üstte 10×10 lacivert
bir deniz görmelisin.

# --hint--

Both loops use `< N`, and the inner one is inside the outer one's `{ }`.

# --hint-tr--

İki döngü de `< N` kullanır; içteki döngü dıştakinin `{ }` parantezlerinin içindedir.

# --tests--

The sea should have 100 squares with gaps between them.
tr: Denizde, aralarında boşluk olan 100 kare olmalı.

```js
const squares = $.rects('#1e3a8a')
assert.lengthOf(squares, 100)
assert.deepEqual([squares[0].x, squares[0].y, squares[0].w, squares[0].h], [31, 51, 34, 34])
assert.deepEqual([squares[99].x, squares[99].y], [31 + 9 * 36, 51 + 9 * 36])
```

# --seed--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
```

# --solution--

```js
// Battleship, step by step.
// The page already has <canvas id="game" width="420" height="620"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 10
const BIG = 36 // cell size of the enemy's sea, where you shoot
const SEA = { x: 30, y: 50 }

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#1e3a8a'
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N; c++) {
    ctx.fillRect(SEA.x + c * BIG + 1, SEA.y + r * BIG + 1, BIG - 2, BIG - 2)
  }
}
```
