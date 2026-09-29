---
title: Thrust and drift
title_tr: İtki ve kayma
skills: [game.physics, game.input]
---

# --goal--

Up is **thrust**: it does not set the speed, it **adds** a little velocity in the direction the ship faces. Then the ship
moves by its velocity every frame. It keeps drifting the way it was going, even after you turn: that is inertia.

# --goal-tr--

Yukarı ok **itki**: hızı **ayarlamaz**, geminin baktığı yöne biraz hız **ekler**. Yön hesabı burundakiyle aynı:
`cos` ve `sin`. Sonra gemi her karede hızı kadar yer değiştirir.

Asteroids'in ünlü hissi buradan gelir: gemi gittiği yöne **kaymayı sürdürür**; arkanı dönmek onu durdurmaz. Durmak için
dönüp ters yöne itmen gerekir. Buna **eylemsizlik** denir; Newton'un kuralı.

# --code--

```js
const THRUST = 0.12

  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * THRUST
    ship.vy += Math.sin(ship.angle) * THRUST
  }
  ship.x += ship.vx
  ship.y += ship.vy
```

# --meaning--

- While up is held, the direction `(cos, sin)` times `THRUST` is added to the velocity.
- Every frame the position changes by the velocity, whether or not a key is held.

# --meaning-tr--

- `if (keys.ArrowUp) { ... }` → yukarı ok basılıysa süslü parantezin içindeki **iki satır** da çalışır.
- `ship.vx += Math.cos(ship.angle) * THRUST` → baktığın yönün sağa doğru payı kadar sağa hız ekle; `vy` aynısı, aşağı
  doğru.
- `ship.x += ship.vx` → gemi, sağa doğru hızı kadar yer değiştirir. Bu iki satır `if`'in **dışında**: tuşa basmasan da
  gemi kaymaya devam eder.

# --task--

1. Under `TURN` write `THRUST`.
2. In `update`, under the two turning lines, write the thrust block and the two moving lines.

# --task-tr--

1. `const TURN = ...` satırının altına `THRUST` satırını yaz.
2. `update` içinde iki dönüş satırının **altına** itki bloğunu ve iki hareket satırını yaz.
3. **Çalıştır**, oyuna tıkla ve yukarı oka bas: gemi baktığı yöne gitmeli ve bırakınca da kaymaya devam etmeli. (Ekrandan
   çıkıp kaybolabilir; ileride düzelteceğiz.)

# --predict--

You fly up, then turn the ship to face down without pressing up. Which way does it move?
- [x] Still up
  Turning changes only `angle`; the velocity stays until thrust changes it.
- [ ] Down
- [ ] It stops

# --predict-tr--

Yukarı uçtun, sonra yukarı oka basmadan gemiyi aşağı çevirdin. Gemi hangi yöne gider?
- [x] Hâlâ yukarı
  Dönmek sadece `angle`'ı değiştirir; hız, itki onu değiştirene kadar aynı kalır.
- [ ] Aşağı
- [ ] Durur

# --tests--

Thrust should push the ship the way it faces, and it should keep drifting.
tr: İtki gemiyi baktığı yöne itmeli ve gemi kaymaya devam etmeli.

```js
$.press('ArrowUp')
$.tick(10)
$.release('ArrowUp')
assert.isBelow(ship.vy, -1, 'moving up')
assert.closeTo(ship.vx, 0, 1e-9)
const y = ship.y
$.tick(10)
assert.isBelow(ship.y, y, 'still drifting up without thrust')
```

Turning should not stop the drift.
tr: Dönmek kaymayı durdurmamalı.

```js
ship.vx = 2
ship.vy = 0
ship.angle = Math.PI
update()
assert.closeTo(ship.x, 302, 1e-9)
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
const THRUST = 0.12

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
  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * THRUST
    ship.vy += Math.sin(ship.angle) * THRUST
  }
  ship.x += ship.vx
  ship.y += ship.vy
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
