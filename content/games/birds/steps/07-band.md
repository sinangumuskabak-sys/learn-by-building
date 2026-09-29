---
title: The rubber band
title_tr: Lastik
skills: [game.canvas]
---

# --goal--

A dark line from the top of the sling to the bird is the rubber band. It is drawn before the bird, so the bird sits
on top of it.

# --goal-tr--

Kuş havada asılı gibi duruyor. Onu sapana bağlayan bir **lastik** çizelim: sapanın tepesinden kuşa giden koyu, kalın
bir çizgi.

Çizgi de daire gibi bir **yol** (path) ile çizilir; ama içi boyanmaz, **kenarı** boyanır. Lastiği kuştan önce
çiziyoruz ki kuş lastiğin üstünde dursun.

# --code--

```js
ctx.strokeStyle = '#451a03'
ctx.lineWidth = 3
ctx.beginPath()
ctx.moveTo(SLING.x, SLING.y)
ctx.lineTo(bx, by)
ctx.stroke()
```

# --meaning--

- `strokeStyle` and `lineWidth` are the line's color and thickness.
- `moveTo` puts the pen down at the sling without drawing; `lineTo` draws a straight line to the bird.
- `stroke()` paints the line (while `fill()` paints the inside of a shape).

# --meaning-tr--

- `ctx.strokeStyle = '#451a03'` → **çizgi** rengi (çok koyu kahve). `fillStyle` içi, `strokeStyle` kenarı boyar.
- `ctx.lineWidth = 3` → çizgi kalınlığı: 3 piksel.
- `ctx.beginPath()` → yeni bir yol.
- `ctx.moveTo(SLING.x, SLING.y)` → kalemi sapanın tepesine **koyar**, çizmeden.
- `ctx.lineTo(bx, by)` → oradan kuşun yerine düz bir çizgi çeker.
- `ctx.stroke()` → çizgiyi boyar. Bu satır olmadan çizgi görünmez.

# --task--

In `draw`, write the six lines between `const by = ...` and `ctx.fillStyle = MATERIALS.bird.color`.

# --task-tr--

1. `draw` içinde `const by = ...` satırının **altına**, `ctx.fillStyle = MATERIALS.bird.color` satırının üstüne altı
   satırı yaz.
2. **Çalıştır**: sapanın tepesinden kuşa uzanan koyu bir lastik görmelisin.

# --hint--

If the line does not show up, check `ctx.stroke()` at the end: without it nothing is painted.

# --hint-tr--

Çizgi görünmüyorsa sondaki `ctx.stroke()` satırını kontrol et: o olmadan hiçbir şey boyanmaz.

# --tests--

A band 3 pixels wide should go from the top of the sling to the bird.
tr: Sapanın tepesinden kuşa 3 piksel kalınlığında bir lastik gitmeli.

```js
aim = { angle: 0, pull: 70 }
$.tick()
const s = $.screen()
assert.isTrue(s.some((c) => c.op === 'moveTo' && c.args[0] === 90 && c.args[1] === 220), 'the band starts at the sling')
const band = s.filter((c) => c.op === 'lineTo').map((c) => c.args.map((v) => Math.round(v)).join())
assert.include(band, '55,220', 'the band reaches the bird')
assert.isTrue(s.some((c) => c.op === 'stroke'), 'stroke() paints the line')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const BIRD = 10 // the bird is a 20 by 20 box
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let aim // { angle, pull }

function reset() {
  aim = { angle: -0.6, pull: 50 }
}

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
  const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
  ctx.strokeStyle = '#451a03'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(SLING.x, SLING.y)
  ctx.lineTo(bx, by)
  ctx.stroke()
  ctx.fillStyle = MATERIALS.bird.color
  ctx.beginPath()
  ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
