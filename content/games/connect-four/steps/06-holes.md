---
title: All 42 holes
title_tr: 42 deliğin hepsi
skills: [prog.loops]
---

# --goal--

One loop drew a row. A second loop around it, over the rows, draws every row: 6 × 7 = 42 holes. This is a **nested**
loop.

# --goal-tr--

Bir döngü bir satırı çizdi. Onu bir döngünün **içine** daha koyarsak her satır için bütün sütunları gezeriz: 6 × 7 =
**42 delik**. Buna **iç içe döngü** denir. Dıştaki döngü satırları, içteki sütunları sayar.

# --code--

```js
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const x = col * CELL + CELL / 2
    const y = TOP + row * CELL + CELL / 2
    disc(x, y, '#0f172a')
  }
}
```

# --meaning--

- The outer loop goes through the rows 0 to 5; for each row, the inner loop goes through the columns 0 to 6.
- `y` now depends on the row: each row is one cell lower.

# --meaning-tr--

- Dış döngü: `row` (satır) 0'dan 5'e. Her satır için iç döngü baştan sona çalışır: `col` 0'dan 6'ya.
- `const y = TOP + row * CELL + CELL / 2` → artık satıra bağlı: her satır bir hücre (64 piksel) aşağıda. 0. satır en
  üstte (128), 5. satır en altta (448).
- İç döngünün satırları bir kat daha içeride (dört boşluk → altı boşluk). Hangi `}`'nin hangi `{`'yi kapattığını
  girintiden okuyabilirsin.

# --task--

Put a `for` loop over the rows around the column loop, and add `row * CELL` to `y`.

# --task-tr--

1. Sütun döngüsünün **üstüne** `for (let row = 0; row < ROWS; row++) {` yaz.
2. Sütun döngüsünü iki boşluk içeri al; altına kapanan `}` koy.
3. `y` satırında `TOP +`'dan sonra `row * CELL +` ekle.
4. **Çalıştır**: 7 sütun, 6 satır, 42 delik.

# --hint--

Each `{` needs its own `}`: two loops, two closing braces before the end of `draw`.

# --hint-tr--

Her `{`'nin kendi `}`'si olmalı: iki döngü, `draw` bitmeden iki kapanan parantez.

# --tests--

There should be a hole for every cell.
tr: Her hücre için bir delik olmalı.

```js
draw()
const holes = $.arcs().filter((a) => a.color === '#0f172a' && a.r === 26)
assert.lengthOf(holes, 42)
assert.deepEqual([holes[0].x, holes[0].y], [32, 128])
assert.deepEqual([holes[41].x, holes[41].y], [416, 448])
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc

function disc(x, y, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL + CELL / 2
      const y = TOP + row * CELL + CELL / 2
      disc(x, y, '#0f172a')
    }
  }
}

draw()
```
