---
title: The game loop
title_tr: Oyun döngüsü
skills: [game.loop]
---

# --goal--

A game runs in a loop: update, draw, again, about 60 times a second. `requestAnimationFrame(loop)` asks the browser to
run `loop` before the next screen refresh, and `loop` asks again each time.

# --goal-tr--

Oyunlar bir **döngü** ile çalışır: güncelle → çiz → tekrar... Saniyede yaklaşık **60 kez**. Her tura **kare** (frame)
denir; çizgi filmin kareleri gibi.

`requestAnimationFrame(loop)` tarayıcıya "ekranı bir dahaki yenilemenden önce `loop`'u çalıştır" der. `loop` da her
seferinde kendi devamını ister; döngü hiç durmaz.

# --code--

```js
function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

resetShip()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` does one frame: move, then draw, then book the next frame.
- At the bottom, `requestAnimationFrame(loop)` replaces the single `draw()` call and starts the loop.

# --meaning-tr--

- `function loop()` → döngünün **bir turu**: önce `update()` (durumu değiştir), sonra `draw()` (yeni durumu çiz).
- `requestAnimationFrame(loop)` → bir sonraki kareyi ister.
- En alttaki tek seferlik `draw()` gidiyor; yerine döngüyü **başlatan** `requestAnimationFrame(loop)` geliyor.

# --task--

1. Under `draw`, after an empty line, write `loop`.
2. At the bottom, replace `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. `draw` fonksiyonunun altına bir boş satır bırakıp `loop` fonksiyonunu yaz.
2. En alttaki `draw()` satırını sil; yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**. Önce oyuna tıkla, sonra sol ve sağ oklara bas: gemi dönmeli.

# --hint--

Click the game first, so the key presses go to it.

# --hint-tr--

Önce oyunun üstüne tıkla ki tuşlar ona gitsin.

# --tests--

The arrows should turn the ship.
tr: Oklar gemiyi döndürmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.closeTo(ship.angle, -Math.PI / 2 + 0.7, 1e-9)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(20)
assert.closeTo(ship.angle, -Math.PI / 2 - 0.7, 1e-9)
```

The loop should keep running.
tr: Döngü sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose
const TURN = 0.07 // radians per frame

let ship
const keys = {}

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function update() {
  if (keys.ArrowLeft) ship.angle -= TURN
  if (keys.ArrowRight) ship.angle += TURN
}

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
  const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  drawShip()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

resetShip()
requestAnimationFrame(loop)
```
