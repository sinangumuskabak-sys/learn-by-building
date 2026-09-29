---
title: Draw the holes
title_tr: Delikleri çiz
skills: [game.canvas, prog.functions]
---

# --goal--

All the drawing goes into a `draw` function: first the field, then a dark brown circle for every hole.

# --goal-tr--

Bütün çizimi bir `draw` (çiz) **fonksiyonunda** topluyoruz, çünkü oyun ekranı saniyede onlarca kez yeniden çizecek.
Önce çayır, sonra her delik için koyu kahverengi bir **daire**.

# --code--

```js
function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
```

# --meaning--

- `for (const hole of holes)` repeats once for each hole in the list.
- A circle is drawn in three steps: `beginPath` starts a new shape, `arc` describes the circle (middle, radius, from angle
  0 to a full turn `Math.PI * 2`), `fill` paints it.
- `draw()` at the end runs the function once.

# --meaning-tr--

- `function draw() { ... }` → çizim tarifi; `draw()` onu çalıştırır.
- `for (const hole of holes)` → listedeki **her delik** için bir kez dön; o anki deliğin adı `hole`.
- Daire üç adımda çizilir:
  - `ctx.beginPath()` → yeni bir şekle başla.
  - `ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)` → merkezi (`hole.x`, `hole.y`), yarıçapı 40 olan bir yay; 0'dan
    `Math.PI * 2`'ye, yani **tam tur**: daire. (Açılar derece değil radyan: tam tur 2π.)
  - `ctx.fill()` → şeklin içini boya.

# --task--

Wrap the two background lines in `function draw() { ... }`, add the holes loop inside it, and call `draw()` at the end.

# --task-tr--

1. Arka planı boyayan iki satırın üstüne `function draw() {` yaz, iki satırı içeri al.
2. Altlarına bir boş satır bırakıp delik döngüsünü yaz, sonra fonksiyonu `}` ile kapat.
3. En alta, bir boş satırdan sonra `draw()` yaz. **Çalıştır**: dokuz koyu delik görmelisin.

# --tests--

`draw()` should paint the field and nine holes of radius 40.
tr: `draw()` çayırı ve yarıçapı 40 olan dokuz deliği çizmeli.

```js
assert.isFunction(draw)
draw()
const holesDrawn = $.arcs().filter((a) => a.color === '#3f2d1d' && a.r === 40)
assert.lengthOf(holesDrawn, 9)
assert.deepEqual([holesDrawn[4].x, holesDrawn[4].y], [180, 220])
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

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
  }
}

draw()
```
