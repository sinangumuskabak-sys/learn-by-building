---
title: Where each square is
title_tr: Her kare nerede
skills: [game.canvas, prog.functions]
---

# --goal--

A square is 90 pixels with a 6-pixel gap between squares. `squareX(i)` and `squareY(i)` give the top-left corner of
square `i`, with the board centered and a strip left at the top for text.

# --goal-tr--

Şimdi piksellere geçiyoruz. Her kare 90 piksel (`SIZE`), kareler arasında 6 piksel aralık (`GAP`) olacak. Tahtayı
yatayda **ortalayacağız**; üstte de yazılar için 60 piksellik bir şerit bırakacağız.

İki küçük fonksiyon `i`. karenin **sol üst köşesini** verecek: `squareX(i)` ve `squareY(i)`.

# --code--

```js
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}
```

# --meaning--

- The board is `4 × 90 + 3 × 6` = 378 pixels wide; `LEFT` is half of what is left of the 400: 11.
- Each column is `SIZE + GAP` = 96 pixels further to the right, each row 96 pixels further down.
- `return` gives the result back.

# --meaning-tr--

- `SIZE = 90` → karenin kenarı. `GAP = 6` → kareler arası aralık. `TOP = 60` → üstteki yazı şeridi.
- `LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2` → tahtanın eni: 4 kare (4 × 90) + aralarındaki 3 aralık
  (3 × 6) = 378. Tuvalin eninden (400) çıkar, **ikiye böl** (`/`): soldaki boşluk **11**. Böylece tahta ortalanır.
- `function squareX(i) { return ... }` → `return` sonucu **geri verir**; `squareX(6)` bir sayı olur.
- `LEFT + colOf(i) * (SIZE + GAP)` → her sütun bir öncekinden 96 piksel (kare + aralık) sağda.
- `squareY` aynısı, satırlar için ve `TOP`'tan başlayarak.

# --task--

1. Under the `N` line, write the four size lines.
2. Above `function draw() {`, write `squareX` and `squareY` and leave an empty line. Press **Run**.

# --task-tr--

1. `const N = 4 ...` satırının altına dört ölçü satırını yaz.
2. `function draw() {` satırının **üstüne** `squareX` ve `squareY` fonksiyonlarını yaz; `draw` ile arada bir boş satır
   kalsın.
3. **Çalıştır**. Ekran değişmez; kontroller hesabı deniyor.

# --tests--

The board should be centered: `LEFT` is 11.
tr: Tahta ortalı olmalı: `LEFT` 11.

```js
assert.strictEqual(LEFT, 11)
assert.deepEqual([SIZE, GAP, TOP], [90, 6, 60])
```

`squareX` and `squareY` should give the top-left corner of a square.
tr: `squareX` ve `squareY` bir karenin sol üst köşesini vermeli.

```js
assert.deepEqual([squareX(0), squareY(0)], [11, 60])
assert.deepEqual([squareX(6), squareY(6)], [11 + 2 * 96, 60 + 96])
assert.deepEqual([squareX(15), squareY(15)], [11 + 3 * 96, 60 + 3 * 96])
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

reset()
draw()
```
