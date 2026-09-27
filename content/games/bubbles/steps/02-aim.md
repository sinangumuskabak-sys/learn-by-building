---
title: Aiming the shooter
title_tr: Atıcıyla nişan almak
skills: [game.input, prog.functions]
---

# --explanation--

The shooter sits at the bottom and fires upwards. The aim is an angle, and on the canvas **straight up is `-π/2`**, because
y grows downwards.

Two ways to aim:

- the arrow keys turn the angle a little each press;
- the pointer: the angle from the shooter to the pointer is `Math.atan2(dy, dx)`, where `dy` and `dx` go from the shooter to the
  pointer. Points below the shooter are ignored; you cannot shoot into the floor.

Either way the angle is **clamped**: never flatter than 0.15 radians from the horizontal. A shot almost along the floor would
bounce between the walls for ages and never reach the bubbles.

```js
const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))
```

The shooter shows the **loaded** bubble, and a smaller one beside it shows the **next**. Knowing the next color is what lets a
player plan two moves ahead.

# --explanation-tr--

Atıcı altta durur ve yukarı ateş eder. Nişan bir açıdır ve canvas'ta **tam yukarı `-π/2`'dir**, çünkü y aşağı doğru büyür.

Nişan almanın iki yolu:

- ok tuşları her basışta açıyı biraz döndürür;
- işaretçi: atıcıdan işaretçiye açı `Math.atan2(dy, dx)`'tir; `dy` ve `dx` atıcıdan işaretçiye gider. Atıcının altındaki noktalar
  yok sayılır; zemine ateş edemezsin.

İki durumda da açı **sınırlanır**: yataydan asla 0,15 radyandan daha yatık değil. Neredeyse zemin boyunca bir atış duvarlar
arasında uzun süre sekip balonlara hiç ulaşmazdı.

```js
const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))
```

Atıcı **yüklü** balonu gösterir ve yanındaki daha küçük bir balon **sıradakini** gösterir. Sıradaki rengi bilmek bir oyuncunun iki
hamle ilerisini planlamasını sağlayan şeydir.

# --task--

1. Add `SHOOTER = { x: 200, y: 490 }`, `aim` (`-Math.PI / 2` in `reset()`), and `loaded` and `next`, each a random color index
   from `pickColor()`.
2. Write `clampAim(angle)`. Left and Right change `aim` by `0.04` (clamped, `preventDefault()`).
3. Write `pointAt(event)`: convert to canvas pixels and, if the point is above the shooter, aim at it. Call it on `pointermove`
   and `pointerdown`.
4. Draw the aim line (`'rgba(255, 255, 255, 0.6)'`, width 2) from the shooter 80 pixels along the aim, the loaded bubble at the
   shooter and the next one (radius 12) at `(SHOOTER.x + 60, SHOOTER.y + 10)`.

# --task-tr--

1. `SHOOTER = { x: 200, y: 490 }`, `aim` (`reset()`'te `-Math.PI / 2`) ve her biri `pickColor()`'dan rastgele bir renk sırası olan
   `loaded` ile `next`'i ekle.
2. `clampAim(angle)` yaz. Sol ve Sağ `aim`'i `0.04` değiştirir (sınırlı, `preventDefault()`).
3. `pointAt(event)` yaz: canvas piksellerine çevir ve nokta atıcının üstündeyse ona nişan al. Onu `pointermove` ve `pointerdown`'da
   çağır.
4. Nişan çizgisini (`'rgba(255, 255, 255, 0.6)'`, kalınlık 2) atıcıdan nişan boyunca 80 piksel, yüklü balonu atıcıda ve
   sıradakini (yarıçap 12) `(SHOOTER.x + 60, SHOOTER.y + 10)`'da çiz.

# --tests--

The arrow keys should turn the aim, never flatter than 0.15 radians.
tr: Ok tuşları nişanı döndürmeli, asla 0,15 radyandan daha yatık değil.

```js
assert.closeTo(aim, -Math.PI / 2, 1e-9, 'straight up')
$.press('ArrowLeft')
assert.closeTo(aim, -Math.PI / 2 - 0.04, 1e-9)
for (let i = 0; i < 100; i++) $.press('ArrowLeft')
assert.closeTo(aim, -Math.PI + 0.15, 1e-9, 'never flat along the floor')
for (let i = 0; i < 200; i++) $.press('ArrowRight')
assert.closeTo(aim, -0.15, 1e-9)
```

The pointer should aim at itself, ignoring points below the shooter.
tr: İşaretçi kendine nişan aldırmalı, atıcının altındaki noktaları yok sayarak.

```js
$.move(100, 390)
assert.closeTo(aim, -3 * Math.PI / 4, 1e-9, 'aims at the pointer')
$.move(300, 500)
assert.closeTo(aim, -3 * Math.PI / 4, 1e-9, 'below the shooter: ignored')
$.move(399, 489)
assert.closeTo(aim, -0.15, 1e-9, 'clamped')
```

The aim line, the loaded bubble and the next one should be drawn.
tr: Nişan çizgisi, yüklü balon ve sıradaki çizilmeli.

```js
assert.include([0, 1, 2, 3, 4], loaded)
assert.include([0, 1, 2, 3, 4], next)
aim = -Math.PI / 2
$.tick(1)
assert.deepInclude($.arcs(), { x: 200, y: 490, r: 19, color: COLORS[loaded] })
assert.deepInclude($.arcs(), { x: 260, y: 500, r: 11, color: COLORS[next] })
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '200,410', 'the aim line')
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const ROW_H = R * Math.sqrt(3) // rows overlap so the bubbles nest
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SHOOTER = { x: 200, y: 490 }

let grid // grid[r][c]: a color index, or -1 for an empty cell
let aim // angle of the shot, in radians
let loaded // color of the bubble in the shooter
let next // color of the one after

const cols = (r) => (r % 2 === 0 ? COLS : COLS - 1)
const cellPos = (r, c) => ({ x: R + c * 2 * R + (r % 2) * R, y: TOP + R + r * ROW_H })

const pickColor = () => Math.floor(Math.random() * COLORS.length)

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < cols(r); c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
  aim = -Math.PI / 2
  loaded = pickColor()
  next = pickColor()
}

const clampAim = (angle) => Math.max(-Math.PI + 0.15, Math.min(-0.15, angle))

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim = clampAim(aim - 0.04)
  else if (event.key === 'ArrowRight') aim = clampAim(aim + 0.04)
  else return
  event.preventDefault()
})

function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (y < SHOOTER.y) aim = clampAim(Math.atan2(y - SHOOTER.y, x - SHOOTER.x))
}

canvas.addEventListener('pointermove', pointAt)
canvas.addEventListener('pointerdown', pointAt)

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < cols(r); c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }

  // The aim: a short line from the shooter.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(SHOOTER.x, SHOOTER.y)
  ctx.lineTo(SHOOTER.x + Math.cos(aim) * 80, SHOOTER.y + Math.sin(aim) * 80)
  ctx.stroke()
  drawBubble(SHOOTER.x, SHOOTER.y, loaded)
  drawBubble(SHOOTER.x + 60, SHOOTER.y + 10, next, 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
