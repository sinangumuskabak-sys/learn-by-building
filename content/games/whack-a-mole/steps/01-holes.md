---
title: Nine holes
title_tr: Dokuz delik
skills: [game.canvas, prog.loops, prog.arrays]
---

# --explanation--

The field has 9 holes in a 3×3 grid. This time you do not just draw them: you **store** them, because later every hole
needs its own state (is a mole up in it?). So build an array of hole objects once, with nested loops, and let
`draw()` loop over that array.

Each hole is described by its **center**, since it is drawn and hit-tested as a circle:

```js
{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }
```

`+ CELL / 2` moves from a cell's corner to its middle. The canvas is 360 wide, so three 120-pixel cells fill it
exactly, and a 40-pixel strip on top (`TOP`) is kept for the score and timer.

A circle is a path: `beginPath()`, `arc(x, y, r, 0, Math.PI * 2)`, `fill()`, one per hole.

# --explanation-tr--

Alanda 3×3 ızgarada 9 delik var. Bu sefer onları yalnızca çizmiyorsun: **saklıyorsun**, çünkü ileride her deliğin
kendi durumu olacak (içinde bir köstebek var mı?). Bu yüzden iç içe döngülerle bir kez delik nesnelerinden oluşan bir
dizi kur ve `draw()` o dizi üzerinde dönsün.

Her delik **merkeziyle** tanımlanır; çünkü daire olarak çizilir ve daire olarak isabet testi yapılır:

```js
{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }
```

`+ CELL / 2` hücrenin köşesinden ortasına geçirir. Canvas 360 genişliğinde; üç tane 120 piksellik hücre onu tam
doldurur, üstteki 40 piksellik şerit de (`TOP`) skor ve süre için ayrılır.

Daire bir yoldur: her delik için `beginPath()`, `arc(x, y, r, 0, Math.PI * 2)`, `fill()`.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const SIZE = 3`, `const CELL = 120`,
   `const TOP = 40`, `const HOLE_R = 40`.
2. Build `const holes = []` with nested loops (rows outside, columns inside), pushing
   `{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }` for each hole.
3. Write `draw()`: fill the canvas with `'#65a30d'`, then draw every hole as a `'#3f2d1d'` circle of radius `HOLE_R`.
   Call `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut; `const SIZE = 3`, `const CELL = 120`, `const TOP = 40`,
   `const HOLE_R = 40` ekle.
2. İç içe döngülerle (dışta satırlar, içte sütunlar) her delik için `{ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 }`
   ekleyerek `const holes = []` dizisini kur.
3. `draw()` yaz: canvas'ı `'#65a30d'` ile doldur, sonra her deliği `HOLE_R` yarıçaplı `'#3f2d1d'` bir daire olarak çiz.
   `draw()`'u çağır.

# --tests--

There should be 9 holes, row by row, centered in their cells.
tr: Hücrelerinin ortasında, satır satır 9 delik olmalı.

```js
assert.deepEqual([SIZE, CELL, TOP, HOLE_R], [3, 120, 40, 40])
assert.lengthOf(holes, 9)
assert.include(holes[0], { x: 60, y: 100 })
assert.include(holes[1], { x: 180, y: 100 })
assert.include(holes[3], { x: 60, y: 220 })
assert.include(holes[8], { x: 300, y: 340 })
```

Every hole should be drawn as a dark circle.
tr: Her delik koyu bir daire olarak çizilmeli.

```js
const circles = $.arcs().filter((a) => a.color === '#3f2d1d')
assert.sameDeepMembers(circles, holes.map((h) => ({ x: h.x, y: h.y, r: 40, color: '#3f2d1d' })))
assert.isTrue($.rects('#65a30d').some((r) => r.w === 360 && r.h === 400))
```

# --seed--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2 })
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#3f2d1d'
  for (const hole of holes) {
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
```
