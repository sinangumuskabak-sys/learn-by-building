---
title: Turning
title_tr: Dönmek
skills: [game.input]
---

# --goal--

Every frame, `update` will change the game a little. First job: while left is held the angle gets smaller (turn left),
while right is held it gets bigger (turn right), by `TURN` radians per frame.

# --goal-tr--

Her karede oyunu biraz değiştiren bir `update` (güncelle) fonksiyonu yazıyoruz. İlk işi dönmek: sol ok basılıyken açı
küçülsün (sola dönüş), sağ ok basılıyken büyüsün (sağa dönüş). Her karede `TURN` (0.07) radyan: yaklaşık 4 derece.

# --code--

```js
const TURN = 0.07 // radians per frame

function update() {
  if (keys.ArrowLeft) ship.angle -= TURN
  if (keys.ArrowRight) ship.angle += TURN
}
```

# --meaning--

- `ship.angle -= TURN` takes 0.07 from the angle, `+=` adds it.
- Both ifs are checked every time, so holding both keys cancels out.

# --meaning-tr--

- `if (keys.ArrowLeft) ship.angle -= TURN` → sol ok basılıysa açıdan 0.07 **çıkar**. `-=` "çıkar ve kaydet" demek.
- `if (keys.ArrowRight) ship.angle += TURN` → sağ ok basılıysa 0.07 **ekle**.
- İki `if` de her seferinde sorulur; ikisine birden basarsan birbirini götürür.
- 60 karede 0.07 × 60 = 4.2 radyan: bir saniyede üç çeyrek tur kadar.

# --task--

1. Under `SHIP_R` write `TURN`.
2. Above `function drawShip() {` write `update`, followed by an empty line.

# --task-tr--

1. `const SHIP_R = ...` satırının altına `TURN` satırını yaz.
2. `function drawShip() {` satırının **üstüne** `update` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır** ve oklara bas.

# --predict--

You run it and press the arrows. Does the ship turn?
- [ ] Yes
- [x] No
  Nothing calls `update()` yet, and `draw()` runs only once. The next step adds the game loop.
- [ ] Only to the right

# --predict-tr--

Çalıştırıp oklara basıyorsun. Gemi döner mi?
- [ ] Evet
- [x] Hayır
  `update()`'i henüz kimse çağırmıyor, `draw()` da bir kez çalışıyor. Oyun döngüsünü bir sonraki adımda ekleyeceğiz.
- [ ] Sadece sağa

# --tests--

`update()` should turn the ship while an arrow is held.
tr: `update()` bir ok basılıyken gemiyi döndürmeli.

```js
keys.ArrowRight = true
for (let i = 0; i < 10; i++) update()
assert.closeTo(ship.angle, -Math.PI / 2 + 0.7, 1e-9)
keys.ArrowRight = false
keys.ArrowLeft = true
update()
assert.closeTo(ship.angle, -Math.PI / 2 + 0.63, 1e-9)
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

resetShip()
draw()
```
