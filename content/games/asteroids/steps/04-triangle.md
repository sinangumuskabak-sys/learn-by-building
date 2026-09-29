---
title: A triangle ship
title_tr: Üçgen gemi
skills: [game.canvas]
---

# --goal--

The ship is a triangle: the nose at `angle`, and two back corners at `angle + 2.5` and `angle - 2.5`, the same distance
away. Because every corner comes from the angle, the whole triangle turns with it.

# --goal-tr--

Gemi bir **üçgen**: burun `angle` yönünde, iki arka köşe `angle + 2.5` ve `angle - 2.5` yönünde (iki yana yaklaşık
143°). Üçü de merkezden `SHIP_R` uzakta. Her köşe açıdan hesaplandığı için gemi dönünce üçgen de bütünüyle döner.

# --code--

```js
const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
ctx.beginPath()
ctx.moveTo(tip.x, tip.y)
ctx.lineTo(left.x, left.y)
ctx.lineTo(right.x, right.y)
ctx.closePath()
```

# --meaning--

- `left` and `right` are the back corners, 2.5 radians either side of the nose.
- The pen goes nose → left → right, and `closePath` draws the last line back to the nose.

# --meaning-tr--

- `left` ve `right` → arka köşeler. Hesap burunla aynı; sadece açıya `+ 2.5` ya da `- 2.5` ekleniyor. 2.5 radyan
  yaklaşık 143 derece: köşeler burnun iki yanında, geride kalır.
- Kalem burundan başlar (`moveTo`), sol köşeye, sonra sağ köşeye çizgi çeker (`lineTo`).
- `ctx.closePath()` → başladığı noktaya, yani buruna geri dönerek şekli **kapatır**.

# --task--

In `drawShip`, write `left` and `right` under `tip`, and replace the line to the center with the two corner lines and
`closePath()`.

# --task-tr--

1. `drawShip` içinde `tip` satırının altına `left` ve `right` satırlarını yaz.
2. `ctx.lineTo(ship.x, ship.y)` satırını sil; yerine iki köşe satırını ve `ctx.closePath()` yaz.
3. **Çalıştır**: ortada yukarı bakan beyaz bir üçgen görmelisin.

# --predict--

If the corners were at `angle + 1` and `angle - 1` instead, what would the ship look like?
- [ ] Longer and thinner
- [x] Short and wide, like an arrowhead pointing the wrong way
  The corners would sit ahead of the center, close to the nose, so the triangle gets flat.
- [ ] The same

# --predict-tr--

Köşeler `angle + 1` ve `angle - 1`'de olsaydı gemi nasıl görünürdü?
- [ ] Daha uzun ve ince
- [x] Kısa ve basık, ters dönmüş bir ok ucu gibi
  Köşeler merkezin önüne, buruna yakın düşerdi; üçgen yassılaşırdı.
- [ ] Aynı

# --tests--

The ship should be drawn as a closed triangle.
tr: Gemi kapalı bir üçgen olarak çizilmeli.

```js
const lines = $.screen().filter((c) => c.op === 'lineTo')
assert.lengthOf(lines, 2)
assert.isTrue($.screen().some((c) => c.op === 'closePath'))
```

The back corners should sit 2.5 radians either side of the nose.
tr: Arka köşeler burnun iki yanında 2.5 radyan açıda olmalı.

```js
const [left, right] = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args)
const a = -Math.PI / 2
assert.closeTo(left[0], 300 + Math.cos(a + 2.5) * 14, 0.001)
assert.closeTo(left[1], 225 + Math.sin(a + 2.5) * 14, 0.001)
assert.closeTo(right[0], 300 + Math.cos(a - 2.5) * 14, 0.001)
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose

let ship

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
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
