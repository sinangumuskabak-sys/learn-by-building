---
title: Around the screen
title_tr: Ekranın çevresinden dolaş
skills: [game.physics]
---

# --goal--

Asteroids has no walls: off the right edge you come back on the left, off the top you reappear at the bottom. `%`, the
remainder, does it, with one trap: in JavaScript `-5 % 600` is `-5`. Adding the size first fixes it.

# --goal-tr--

Asteroids'te duvar yoktur: sağdan çıkan gemi soldan, yukarıdan çıkan aşağıdan geri gelir. Uzay kendi etrafında döner.

Bunun aracı **kalan** işlemi `%`: `605 % 600` → `5`; sağ kenarı 5 piksel geçen gemi sol kenardan 5 piksel içeride olur.
Saat de böyle çalışır: `13 % 12` → 1. **Tuzak:** JavaScript'te `%` soldaki sayının işaretini korur: `-5 % 600` sonucu
`595` değil `-5`. Sol ya da üst kenardan çıkan gemi eksi bir yere gider ve kaybolurdu.

Çözüm klasik bir tek satır: kalanı al, boyutu ekle, bir kez daha kalanı al. Bir kez fonksiyon olarak yazıp hareket eden
her şeyde kullanacağız.

# --code--

```js
// Wrap a coordinate around the screen. Plain % keeps the sign in JavaScript (-5 % 600 is -5), so add the size first.
function wrap(value, size) {
  return ((value % size) + size) % size
}

  ship.x = wrap(ship.x + ship.vx, canvas.width)
  ship.y = wrap(ship.y + ship.vy, canvas.height)
```

# --meaning--

- `wrap(-5, 600)`: `-5 % 600` is `-5`, `+ 600` is `595`, `595 % 600` is `595`.
- `wrap(605, 600)`: `5 + 600` is `605`, and the second `%` brings it back to `5`.
- The ship's new position goes through `wrap`, with the canvas width for `x` and its height for `y`.

# --meaning-tr--

- `function wrap(value, size)` → `value` ve `size` **parametre**: çağırırken verdiğin bilgilerin adları.
  `wrap(605, 600)` dediğinde içeride `value` 605, `size` 600 olur.
- `return ...` → sonucu geri ver; `ship.x = wrap(...)` bu sonucu `ship.x`'e yazar.
- Örnek: `wrap(-5, 600)` → `-5 % 600` = `-5`, `+ 600` = `595`, `595 % 600` = `595`. Doğru!
- Örnek: `wrap(605, 600)` → `5`, `+ 600` = `605`, `% 600` = `5`. İkinci `%` bu yüzden var.
- İki hareket satırı artık `+=` değil: yeni konumu hesaplayıp `wrap`'ten geçiriyor. Yatayda tuvalin eni (600), dikeyde
  boyu (450).

# --task--

1. Above `function resetShip() {` write the comment and `wrap`, followed by an empty line.
2. In `update`, replace the two moving lines with the wrapped ones.

# --task-tr--

1. `function resetShip() {` satırının **üstüne** yorum satırını ve `wrap` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `update` içindeki `ship.x += ship.vx` ve `ship.y += ship.vy` satırlarını sil; yerine `wrap`'li iki satırı yaz.
3. **Çalıştır** ve bir kenara doğru uç: öbür kenardan geri gelmelisin.

# --hint--

If the `wrap` check is red, count the parentheses: `((value % size) + size) % size`.

# --hint-tr--

`wrap` kontrolü kırmızıysa parantezleri say: `((value % size) + size) % size`.

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
