---
title: Lines and boxes
title_tr: Çizgiler ve kutular
skills: [game.canvas]
---

# --goal--

The board is divided into nine 3 × 3 boxes. Thin grey lines separate the cells and thick dark lines outline the boxes.

# --goal-tr--

Sudoku tahtası dokuz tane **3 × 3'lük kutuya** bölünür. Hücreler arasına ince gri çizgiler, kutuların etrafına kalın
koyu çizgiler çekiyoruz. 10 dikey ve 10 yatay çizgi var; her üçüncüsü kalın.

# --code--

```js
// Thin lines between cells, thick ones around each box.
for (let i = 0; i <= 9; i++) {
  ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
  const w = i % 3 === 0 ? 3 : 1
  ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
  ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
}
```

# --meaning--

- `i` goes from 0 to 9: 10 lines each way (the edges included).
- `i % 3 === 0` is true for lines 0, 3, 6 and 9, the box borders: dark and 3 pixels wide; the others are grey and 1 pixel.
- Each line is a thin rectangle, centered on the edge (`- w / 2`).

# --meaning-tr--

- `for (let i = 0; i <= 9; i++)` → 0'dan 9'a (9 dahil): 10 çizgi. Kenarlar da çizgi.
- `i % 3 === 0` → 0, 3, 6, 9: kutu sınırları. Onlar koyu ve **3 piksel**; diğerleri gri ve 1 piksel.
- `ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)` → dikey çizgi: ince, uzun bir dikdörtgen. `- w / 2` onu
  hücre sınırının tam **ortasına** yerleştirir.
- İkinci `fillRect` aynısının yatay hâli.

# --task--

In `draw`, after the cells loop, write the comment and the lines loop.

# --task-tr--

`draw` içinde hücre döngüsünün altına yorumu ve çizgi döngüsünü yaz. **Çalıştır**: tahtanın kutuları belirmeli.

# --tests--

There should be 20 lines, the box borders thick and dark.
tr: 20 çizgi olmalı; kutu sınırları kalın ve koyu.

```js
const thick = $.rects('#0f172a')
const thin = $.rects('#94a3b8')
assert.lengthOf(thick, 8)
assert.lengthOf(thin, 12)
assert.isTrue(thick.every((r) => r.w === 3 || r.h === 3))
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, SIZE, SIZE)
    }
  }
  // Thin lines between cells, thick ones around each box.
  for (let i = 0; i <= 9; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
    const w = i % 3 === 0 ? 3 : 1
    ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
    ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
  }
}

draw()
```
