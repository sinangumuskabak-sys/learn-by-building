---
title: The sling
title_tr: Sapan
skills: [game.canvas, prog.functions]
---

# --explanation--

In an Angry Birds-style game you pull a bird back in a sling and let go. The further you pull, the faster it flies, and it
flies the **opposite** way to your pull.

So the aim is two numbers: an `angle` (the direction the bird will fly) and a `pull` (how far back the band is stretched).
From those, where is the bird drawn? Going *along* the angle from the sling uses `cos` and `sin`; going **back** means
subtracting:

```js
const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
```

The `0.5` only makes the drawing smaller; the real pull can be up to 70 pixels, but a bird drawn 70 pixels back would leave
the sling far behind. A line from the sling to the bird is the band.

Remember the canvas y axis points **down**: an angle of `-0.6` radians aims up and to the right, so the bird is drawn down and
to the left.

# --explanation-tr--

Angry Birds tarzı bir oyunda bir kuşu sapanda geri çeker ve bırakırsın. Ne kadar çekersen o kadar hızlı uçar ve çektiğin yönün
**tersine** uçar.

Yani nişan iki sayıdır: bir `angle` (kuşun uçacağı yön) ve bir `pull` (lastiğin ne kadar geri gerildiği). Bunlardan kuş nereye
çizilir? Sapandan açı *boyunca* gitmek `cos` ve `sin` kullanır; **geri** gitmek çıkarmak demektir:

```js
const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
```

`0.5` yalnızca çizimi küçültür; gerçek çekiş 70 piksele kadar olabilir ama 70 piksel geride çizilen bir kuş sapanı çok geride
bırakırdı. Sapandan kuşa bir çizgi lastiktir.

Canvas'ın y ekseninin **aşağıyı** gösterdiğini unutma: `-0.6` radyanlık bir açı yukarıya ve sağa nişan alır, bu yüzden kuş aşağıda
ve solda çizilir.

# --task--

1. Add `GROUND = 290`, `SLING = { x: 90, y: 220 }`, `MAX_PULL = 70`, `BIRD = 10` and
   `MATERIALS = { bird: { color: '#dc2626', density: 4 } }`.
2. `reset()` sets `aim = { angle: -0.6, pull: 50 }`.
3. Draw: the sky `'#bae6fd'`, the ground `'#65a30d'` from `GROUND` down, the sling post `'#78350f'` (8 wide, centered on
   `SLING.x`, from `SLING.y` to the ground), the band (`'#451a03'`, width 3) from the sling to the bird, and the bird: a
   circle of radius `BIRD` at `(bx, by)` above.

# --task-tr--

1. `GROUND = 290`, `SLING = { x: 90, y: 220 }`, `MAX_PULL = 70`, `BIRD = 10` ve
   `MATERIALS = { bird: { color: '#dc2626', density: 4 } }` ekle.
2. `reset()`, `aim = { angle: -0.6, pull: 50 }` yapar.
3. Çiz: gökyüzü `'#bae6fd'`, `GROUND`'dan aşağı zemin `'#65a30d'`, sapan direği `'#78350f'` (8 genişliğinde, `SLING.x`'e ortalı,
   `SLING.y`'den zemine), sapandan kuşa lastik (`'#451a03'`, kalınlık 3) ve kuş: yukarıdaki `(bx, by)`'de `BIRD` yarıçaplı bir
   daire.

# --tests--

The ground and the sling post should be drawn.
tr: Zemin ve sapan direği çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#65a30d'), { x: 0, y: 290, w: 560, h: 30, color: '#65a30d' }, 'the ground')
assert.deepInclude($.rects('#78350f'), { x: 86, y: 220, w: 8, h: 70, color: '#78350f' }, 'the sling post')
```

The bird should sit back in the sling, opposite to the aim.
tr: Kuş sapanda, nişanın tersine geride durmalı.

```js
$.tick(1)
const bx = 90 - Math.cos(-0.6) * 25
const by = 220 - Math.sin(-0.6) * 25
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, bx, 1e-9, 'the bird sits back, away from the aim')
assert.closeTo(b.y, by, 1e-9)
assert.strictEqual(b.r, 10)
```

A longer pull should draw the bird further back, with the band reaching it.
tr: Daha uzun bir çekiş kuşu daha geride çizmeli ve lastik ona ulaşmalı.

```js
aim = { angle: 0, pull: 70 }
$.tick(1)
const b = $.arcs().find((a) => a.color === '#dc2626')
assert.closeTo(b.x, 55, 1e-9, 'pulled 70 to the left: half of that on screen')
assert.closeTo(b.y, 220, 1e-9)
const band = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map((v) => Math.round(v)).join())
assert.include(band, '55,220', 'the band reaches the bird')
```

# --seed--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
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
const MAX_PULL = 70
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

  // The sling, and the bird pulled back in it.
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
