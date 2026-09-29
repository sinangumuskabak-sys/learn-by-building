---
title: Gravity
title_tr: Yer çekimi
skills: [game.physics]
---

# --goal--

The player gets a vertical speed `vy`. Every frame gravity adds to it and the speed moves the player, so it falls
faster and faster, until its feet reach the floor.

# --goal-tr--

Zıplayana bir **dikey hız** veriyoruz: `vy`. Her karede **yer çekimi** bu hıza biraz ekler, hız da zıplayanı hareket
ettirir. Böylece giderek **hızlanarak** düşer; ayakları tabana değince durur.

# --code--

```js
const GRAVITY = 0.35
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }

function update() {
  player.vy += GRAVITY
  player.y += player.vy
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = 0
  }
}

  update()
```

# --meaning--

- `vy` is pixels per frame downward (negative is up). Gravity adds 0.35 every frame.
- The feet are at `y + h`; once they reach the floor, the player is put on it and stops.

# --meaning-tr--

- `vy: 0` → dikey hız: her karede kaç piksel **aşağı** gideceği. Eksi değer yukarı demek.
- `player.vy += GRAVITY` → her kare hıza 0,35 ekle: düşüş **hızlanır**.
- `player.y += player.vy` → hıza göre hareket et.
- `player.y + player.h >= FLOOR` → ayaklar (`y + h`) tabana ulaştı mı? Ulaştıysa tabanın tam üstüne koy ve dur.
- `update()` döngüde `draw()`'dan önce: önce hareket, sonra çizim.

# --task--

1. Under `ctx`, write `GRAVITY` and `FLOOR`; add `, vy: 0` to `player`.
2. Under `player`, write `update`; call it in `loop` before `draw()`.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `GRAVITY` ve `FLOOR` sabitlerini yaz.
2. `player` nesnesine `, vy: 0` ekle.
3. `player` satırının altına `update` fonksiyonunu yaz; `loop` içinde `draw()`'ın üstüne `update()` yaz.
4. **Çalıştır**: kutu düşüp tabana oturmalı.

# --tests--

The player should fall faster and faster.
tr: Zıplayan giderek hızlanarak düşmeli.

```js
player.y = 100
player.vy = 0
update()
update()
assert.closeTo(player.vy, 0.7, 1e-9)
assert.closeTo(player.y, 101.05, 1e-9)
```

It should land on the floor and stop there.
tr: Tabana inip orada durmalı.

```js
$.run(3)
assert.strictEqual(player.y, 560)
assert.strictEqual(player.vy, 0)
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }

function update() {
  player.vy += GRAVITY
  player.y += player.vy
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = 0
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
