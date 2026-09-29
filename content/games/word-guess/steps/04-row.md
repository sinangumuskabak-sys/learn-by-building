---
title: A row of five tiles
title_tr: Beş karelik bir satır
skills: [game.canvas, prog.loops]
---

# --goal--

A guess is five letters, so a row has five tiles. A `for` loop draws them, each `SIZE + GAP` pixels to the right of
the last, with the row centered. Empty tiles are only outlines.

# --goal-tr--

Bir tahmin beş harf; yani bir satırda **beş kare** var. Beş kareyi tek tek yazmak yerine bir **döngü** kullanacağız:
"şunu 5 kez yap, her seferinde biraz sağa kay".

Satırı ortalayacağız: satırın enini tuvalin eninden çıkarıp kalanı ikiye böleriz. Boş kareler içi dolu değil, sadece
**çerçeve** olacak.

# --code--

```js
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

  for (let i = 0; i < 5; i++) {
    const x = LEFT + i * (SIZE + GAP)
    const y = TOP
    ctx.strokeStyle = '#3f3f46'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
  }
```

# --meaning--

- A tile is 56 pixels with 6 pixels between tiles. Five tiles and four gaps are 304 pixels; `LEFT` is half of what is
  left of the 360: 28.
- `for (let i = 0; i < 5; i++)` repeats with `i` = 0, 1, 2, 3, 4.
- Tile `i` is `i * (SIZE + GAP)` to the right of `LEFT`.
- `strokeRect` draws only the border of a rectangle (`fillRect` fills it); `strokeStyle` and `lineWidth` pick its
  colour and thickness. It is drawn 1 pixel inside the tile, so the 2-pixel border stays inside.

# --meaning-tr--

- `SIZE = 56` → bir harf karesi. `GAP = 6` → kareler arası boşluk. `TOP = 12` → satırın üstten uzaklığı.
- `LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2` → 5 kare (5 × 56) ve aralarındaki 4 boşluk (4 × 6) = 304 piksel.
  Tuvalin eninden (360) çıkar, **ikiye böl** (`/`): soldaki boşluk **28**. Böylece satır ortalanır.
- `for (let i = 0; i < 5; i++) { ... }` → bir **döngü**: `i` 0'dan başlar, 5'ten küçük olduğu sürece tekrarlar, her
  turda `i++` ile 1 artar. Yani `i` sırayla 0, 1, 2, 3, 4.
- `const x = LEFT + i * (SIZE + GAP)` → her kare bir öncekinden 62 piksel (kare + boşluk) sağda.
- `ctx.strokeStyle` → **çizgi** rengi; `ctx.lineWidth = 2` → çizgi kalınlığı.
- `ctx.strokeRect(...)` → dikdörtgenin **sadece çerçevesini** çizer (`fillRect` içini doldururdu). 1 piksel içeriden,
  2 piksel küçük çizilir ki kalın çizgi karenin içinde kalsın.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the four size lines.
2. In `draw`, under the `fillRect` line, leave an empty line and write the loop. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp dört ölçü satırını yaz.
2. `draw` içinde `ctx.fillRect(...)` satırının altına bir boş satır bırakıp döngüyü yaz.
3. **Çalıştır**: üstte ortalanmış beş boş kare görmelisin.

# --try--

Change `5` in the `for` line to `3`: only three tiles. Put `5` back.

# --try-tr--

`for` satırındaki `5`'i `3` yap: sadece üç kare çizilir. Sonra `5`'e geri al.

# --tests--

The row should be centered.
tr: Satır ortalı olmalı.

```js
assert.strictEqual(LEFT, 28)
assert.deepEqual([SIZE, GAP, TOP], [56, 6, 12])
```

Five tiles should be drawn as outlines.
tr: Beş kare çerçeve olarak çizilmeli.

```js
draw()
const boxes = $.screen().filter((c) => c.op === 'strokeRect')
assert.lengthOf(boxes, 5)
assert.deepEqual(boxes[0].args, [29, 13, 54, 54])
assert.deepEqual(boxes[4].args, [29 + 4 * 62, 13, 54, 54])
assert.strictEqual(boxes[0].stroke, '#3f3f46')
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 5; i++) {
    const x = LEFT + i * (SIZE + GAP)
    const y = TOP
    ctx.strokeStyle = '#3f3f46'
    ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
  }
}

draw()
```
