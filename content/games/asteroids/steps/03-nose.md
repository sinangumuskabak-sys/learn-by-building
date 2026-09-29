---
title: Which way it points
title_tr: Nereye bakıyor?
skills: [game.physics, game.canvas]
---

# --goal--

The one bit of trigonometry games use every day: a direction at angle `a` is `(Math.cos(a), Math.sin(a))`. The ship's
nose is `SHIP_R` pixels from its center in that direction. For now we draw a line from the nose to the center.

# --goal-tr--

Oyun programcılarının her gün kullandığı tek trigonometri bilgisi şu:

> `a` açısındaki yön, `(Math.cos(a), Math.sin(a))` ikilisidir.

`Math.cos(a)` o yönde **sağa** ne kadar gidildiğini, `Math.sin(a)` **aşağı** ne kadar gidildiğini söyler (ikisi de -1
ile 1 arası). Merkezden `a` yönünde `r` piksel ötedeki nokta: `x + cos(a) * r`, `y + sin(a) * r`.

Geminin **burnu** merkezden `SHIP_R` (14) piksel ötede, baktığı yönde. Şimdilik burundan merkeze beyaz bir çizgi
çizeceğiz: pusula iğnesi gibi, geminin nereye baktığını gösterir.

# --code--

```js
const SHIP_R = 14 // the ship's size: distance from its center to its nose

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(ship.x, ship.y)
  ctx.stroke()
}

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  drawShip()
```

# --meaning--

- `tip` is the nose: `SHIP_R` pixels from the center in the direction of `ship.angle`.
- A path: `beginPath` starts it, `moveTo` puts the pen down without drawing, `lineTo` draws a line, `stroke` paints the
  lines in `strokeStyle` (white), `lineWidth` pixels thick.

# --meaning-tr--

- `Math.cos(ship.angle) * SHIP_R` → baktığı yönde sağa ne kadar; `Math.sin(ship.angle) * SHIP_R` → aşağı ne kadar.
  Yukarı bakınca cos 0, sin -1: burun (300, 211), merkezin 14 piksel üstü.
- `const tip = { x: ..., y: ... }` → burnun yeri, iki bilgili küçük bir nesne.
- `ctx.beginPath()` → yeni bir çizime başla.
- `ctx.moveTo(tip.x, tip.y)` → kalemi buruna koy (çizmeden).
- `ctx.lineTo(ship.x, ship.y)` → oradan merkeze çizgi çek.
- `ctx.stroke()` → çizgileri boya. İçini doldurmuyoruz: 1979'daki orijinal oyunun parlayan çizgi görünümü.
- `ctx.strokeStyle = 'white'` → çizgi rengi, `ctx.lineWidth = 2` → çizgi kalınlığı (piksel).

# --task--

1. Under the two canvas lines, after an empty line, write `SHIP_R` and an empty line.
2. Above `function draw() {` write `drawShip`, followed by an empty line.
3. In `draw`, under the black background, leave an empty line and write the three new lines.

# --task-tr--

1. `const ctx = ...` satırının altındaki boş satırdan sonra `SHIP_R` satırını yaz; altında bir boş satır kalsın
   (`let ship`'ten önce).
2. `function draw() {` satırının **üstüne** `drawShip` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `draw` içinde siyah arka planı boyayan `fillRect` satırının altına bir boş satır bırakıp üç yeni satırı yaz.
4. **Çalıştır**: ortada yukarı doğru kısa beyaz bir çizgi görmelisin.

# --try--

In `resetShip`, try `angle: 0` and then `angle: Math.PI / 4`: the line turns right, then down-right. Put `-Math.PI / 2` back.

# --try-tr--

`resetShip` içinde önce `angle: 0`, sonra `angle: Math.PI / 4` dene: çizgi sağa, sonra sağ alta döner. Sonra `-Math.PI / 2`'ye geri al.

# --tests--

The nose should be 14 pixels in the direction the ship faces.
tr: Burun, geminin baktığı yönde 14 piksel ötede olmalı.

```js
const start = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(start.args[0], 300, 0.001)
assert.closeTo(start.args[1], 211, 0.001)
assert.isTrue($.screen().some((c) => c.op === 'stroke' && c.stroke === 'white'))
```

Turning the ship should turn its nose.
tr: Gemiyi döndürmek burnunu da döndürmeli.

```js
ship.angle = 0
draw()
const nose = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(nose.args[0], 314, 0.001)
assert.closeTo(nose.args[1], 225, 0.001)
ship.angle = Math.PI / 2
draw()
const down = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(down.args[1], 239, 0.001, 'PI / 2 points down, because y grows downwards')
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
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(ship.x, ship.y)
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
