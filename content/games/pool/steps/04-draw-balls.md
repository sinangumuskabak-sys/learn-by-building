---
title: Draw the balls
title_tr: Topları çiz
skills: [game.canvas]
---

# --goal--

Each ball in `balls` is drawn as a filled circle of radius `R` at its position, in its color.

# --goal-tr--

`balls`'taki her topu kendi renginde, kendi yerinde, `R` yarıçaplı dolu bir **daire** olarak çizeceğiz. Daire çizmek
dikdörtgenden biraz farklı: önce bir **yol** (path) çizilir, sonra içi doldurulur.

# --code--

```js
for (const b of balls) {
  ctx.fillStyle = b.color
  ctx.beginPath()
  ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
  ctx.fill()
}
```

# --meaning--

- `beginPath` starts a new shape.
- `arc(x, y, r, start, end)` adds a circle arc around `(x, y)`; from angle 0 to `Math.PI * 2` (a full turn) is a whole circle.
- `fill` paints the shape in `fillStyle`.

# --meaning-tr--

- `for (const b of balls)` → her top için; o anki topun adı `b`.
- `ctx.fillStyle = b.color` → topun rengi.
- `ctx.beginPath()` → yeni bir **şekil** başlat.
- `ctx.arc(b.x, b.y, R, 0, Math.PI * 2)` → merkezi `(b.x, b.y)`, yarıçapı `R` olan bir **yay**. Son iki sayı başlangıç
  ve bitiş açısı (radyan): 0'dan `Math.PI * 2`'ye, yani **tam bir tur**: daire.
- `ctx.fill()` → şeklin içini boya.

# --task--

In `draw`, under the felt's `fillRect`, leave an empty line and write the loop. Press **Run**.

# --task-tr--

`draw` içinde çuhayı çizen `fillRect` satırının altına bir boş satır bırak ve döngüyü yaz. **Çalıştır**: masanın solunda
beyaz bir top görmelisin.

# --tests--

The cue ball should be drawn as a white circle at its spot.
tr: İsteka topu yerinde beyaz bir daire olarak çizilmeli.

```js
$.tick(1)
assert.deepInclude($.arcs(), { x: 130, y: 160, r: 9, color: '#f8fafc' })
```

Every ball in `balls` should be drawn.
tr: `balls`'taki her top çizilmeli.

```js
balls.push(ball(300, 100, '#dc2626', 3))
$.tick(1)
assert.deepInclude($.arcs(), { x: 300, y: 100, r: 9, color: '#dc2626' })
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
}

function reset() {
  rack()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
