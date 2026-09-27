---
title: Wrapping around the screen
title_tr: Ekranın çevresinde dolaşmak
skills: [game.physics]
---

# --explanation--

In Asteroids there are no walls: fly off the right edge and you come back on the left, off the top and you reappear at
the bottom. The space is a loop, like the surface of a doughnut.

The tool for "go around in a loop" is the remainder operator `%`. `605 % 600` is `5`: past the right edge becomes near
the left. But there is a trap. In JavaScript, `%` keeps the **sign** of the left side: `-5 % 600` is `-5`, not `595`.
Flying off the **left** or **top** edge would produce negative positions and the ship would vanish.

The fix is a classic one-liner: add the size before taking the remainder a second time, so the result is always between
`0` and `size`:

```js
function wrap(value, size) {
  return ((value % size) + size) % size
}
```

Write it once as a function and use it for every moving thing: the ship now, bullets and asteroids soon.

# --explanation-tr--

Asteroids'te duvar yoktur: sağ kenardan uç, soldan geri gelirsin; tepeden çık, altta yeniden belirirsin. Uzay, bir
simidin yüzeyi gibi bir döngüdür.

"Bir döngüde dolaş"ın aracı kalan operatörüdür, `%`. `605 % 600` `5`'tir: sağ kenarı geçmek solun yakını olur. Ama bir
tuzak var. JavaScript'te `%` sol tarafın **işaretini** korur: `-5 % 600` `595` değil `-5`'tir. **Sol** ya da **üst**
kenardan uçmak negatif konumlar üretir ve gemi kaybolurdu.

Çözüm klasik bir tek satırlık: kalanı ikinci kez almadan önce boyutu ekle; böylece sonuç her zaman `0` ile `size`
arasında olur:

```js
function wrap(value, size) {
  return ((value % size) + size) % size
}
```

Onu bir kez fonksiyon olarak yaz ve hareket eden her şey için kullan: şimdi gemi, yakında mermiler ve asteroitler.

# --task--

1. Write `function wrap(value, size)` as above.
2. In `update()`, wrap the ship's new position: `ship.x = wrap(ship.x + ship.vx, canvas.width)`, and the same for `y`
   with `canvas.height`.

# --task-tr--

1. Yukarıdaki gibi `function wrap(value, size)` yaz.
2. `update()` içinde geminin yeni konumunu dolaştır: `ship.x = wrap(ship.x + ship.vx, canvas.width)`, `y` için de
   `canvas.height` ile aynısı.

# --tests--

`wrap()` should always return a value from 0 up to the size.
tr: `wrap()` her zaman 0 ile boyut arasında bir değer döndürmeli.

```js
assert.strictEqual(wrap(605, 600), 5)
assert.strictEqual(wrap(-5, 600), 595)
assert.strictEqual(wrap(0, 600), 0)
assert.strictEqual(wrap(600, 600), 0)
assert.strictEqual(wrap(-1205, 600), 595)
assert.strictEqual(wrap(250, 600), 250)
```

Leaving through any edge should bring the ship back on the other side.
tr: Herhangi bir kenardan çıkmak gemiyi öbür yandan geri getirmeli.

```js
ship.y = 2
ship.vy = -5
ship.vx = 0
update()
assert.isAbove(ship.y, 440)
ship.x = 598
ship.vx = 5
update()
assert.isBelow(ship.x, 10)
ship.x = 1
ship.vx = -4
update()
assert.isAbove(ship.x, 590)
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
const FRICTION = 0.99
const MAX_SPEED = 6

let ship
const keys = {}

// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

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
  ship.vx *= FRICTION
  ship.vy *= FRICTION
  const speed = Math.hypot(ship.vx, ship.vy)
  if (speed > MAX_SPEED) {
    ship.vx *= MAX_SPEED / speed
    ship.vy *= MAX_SPEED / speed
  }
  ship.x = wrap(ship.x + ship.vx, canvas.width)
  ship.y = wrap(ship.y + ship.vy, canvas.height)
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
