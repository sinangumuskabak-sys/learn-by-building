---
title: Four rows
title_tr: Dört sıra
skills: [prog.loops]
---

# --goal--

A loop inside a loop: the outer loop goes down the rows, and for each row the inner loop draws the row's four cards.
4 × 4 = 16 cards.

# --goal-tr--

Bir sıra hazır; şimdi **dört sıra** lazım. Sıra çizen döngüyü bir döngünün **içine** koyarız: **iç içe döngü**.

Dış döngü satırları (`row`) sırayla gezer; her satır için iç döngü o satırdaki dört kartı (`col`) çizer. Bir sınıfta
yoklama almak gibi: sıra sıra, her sırada soldan sağa. 4 × 4 = 16 kart.

# --code--

```js
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}
```

# --meaning--

- The outer loop runs 4 times (`row` = 0 to 3); each time, the inner loop runs 4 times.
- y uses the same pattern as x: `TOP + GAP + row * (CARD + GAP)`.

# --meaning-tr--

- `for (let row = 0; row < SIZE; row++) {` → dış döngü: satırlar, 0'dan 3'e.
- İçerideki döngü önceki adımın döngüsü, iki boşluk içeri kaydı.
- y artık sabit değil: `TOP + GAP + row * (CARD + GAP)` → x ile aynı kalıp: 52, 149, 246, 343.
- Her `{` bir `}` ile kapanmalı: sonda iki `}` var; biri iç döngünün, biri dış döngünün.

# --task--

Put the loop inside a new `row` loop and change the y part of `fillRect` as shown. Press **Run**.

# --task-tr--

1. Döngünün **üstüne** `for (let row = 0; row < SIZE; row++) {` yaz.
2. Eski döngüyü iki boşluk içeri al ve en alta kapanan `}` ekle.
3. `fillRect` içindeki `TOP + GAP` kısmını `TOP + GAP + row * (CARD + GAP)` yap.
4. **Çalıştır**: 4×4 dizilmiş 16 mor kart görmelisin.

# --hint--

If all cards are in one row, the y part is still `TOP + GAP`; add `+ row * (CARD + GAP)`.

# --hint-tr--

Kartların hepsi tek sıradaysa y kısmı hâlâ `TOP + GAP`; sonuna `+ row * (CARD + GAP)` ekle.

# --tests--

There should be 16 face-down cards in a 4×4 grid.
tr: 4×4 ızgarada 16 kapalı kart olmalı.

```js
const cards = $.rects('#6366f1')
assert.lengthOf(cards, 16)
assert.isTrue(cards.every((c) => c.w === 85 && c.h === 85))
const xs = [...new Set(cards.map((c) => c.x))].sort((a, b) => a - b)
const ys = [...new Set(cards.map((c) => c.y))].sort((a, b) => a - b)
assert.deepEqual(xs, [12, 109, 206, 303])
assert.deepEqual(ys, [52, 149, 246, 343])
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}
```
