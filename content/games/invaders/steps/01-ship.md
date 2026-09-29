---
title: The ship
title_tr: Gemi
skills: [game.canvas]
---

# --goal--

We are building a Space Invaders-style shooter: rows of invaders march down, and your ship at the bottom shoots them.
First the ship: a cyan box with a small cannon on top, in the middle of the bottom.

# --goal-tr--

**Space Invaders tarzı** bir nişancı oyunu yapıyoruz: istilacı sıraları aşağı doğru yürüyor, en alttaki gemin onları
vuruyor. Sonunda nasıl olacağını **Bitmiş hâlini gör** ile görebilirsin.

İlk iş gemi: altta, ortada, üstünde küçük bir namlusu olan camgöbeği bir kutu.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

draw()
```

# --meaning--

- The constants name the ship's height on screen and its size.
- `canvas.width / 2 - SHIP_W / 2` puts the ship's middle in the middle of the canvas.
- The cannon is a 6×6 square on top of the ship, centered.

# --meaning-tr--

- `SHIP_Y`, `SHIP_W`, `SHIP_H` → geminin ekrandaki yüksekliği, genişliği, yüksekliği.
- `x: canvas.width / 2 - SHIP_W / 2` → geminin **ortası** tuvalin ortasına gelsin: ortadan yarım gemi sola.
- `draw()` → önce koyu uzay, sonra gemi.
- `ship.x + SHIP_W / 2 - 3` → geminin ortasından 3 piksel sola: 6 piksellik namlu ortalanır; `ship.y - 6` → geminin
  hemen üstü.

# --task--

Write the lines under the comments, then press **Run**.

# --task-tr--

Satırları yorum satırlarının altına yaz ve **Çalıştır**'a bas: altta bir gemi görmelisin.

# --tests--

The ship should be drawn in the middle of the bottom, with its cannon.
tr: Gemi altta ortada, namlusuyla çizilmeli.

```js
assert.deepEqual(ship, { x: 222, y: 480, w: 36, h: 16 })
const parts = $.rects('#22d3ee')
assert.deepEqual(parts[0], { x: 222, y: 480, w: 36, h: 16, color: '#22d3ee' })
assert.deepEqual(parts[1], { x: 237, y: 474, w: 6, h: 6, color: '#22d3ee' })
```

# --seed--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
```

# --solution--

```js
// Invaders, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_Y = 480
const SHIP_W = 36
const SHIP_H = 16

let ship = { x: canvas.width / 2 - SHIP_W / 2, y: SHIP_Y, w: SHIP_W, h: SHIP_H }

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22d3ee'
  ctx.fillRect(ship.x, ship.y, ship.w, ship.h)
  ctx.fillRect(ship.x + SHIP_W / 2 - 3, ship.y - 6, 6, 6)
}

draw()
```
