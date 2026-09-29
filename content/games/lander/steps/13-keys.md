---
title: Remember held keys
title_tr: Basılı tuşları hatırla
skills: [game.input]
---

# --goal--

The lander will be steered by holding keys. The events only note which keys are held; `update` will read the notes
every frame.

# --goal-tr--

Aracı tuşları **basılı tutarak** yöneteceğiz. Bilinen yol: olaylar yalnız **hangi tuşun basılı olduğunu not eder**;
`update` her karede o notlara bakar. Not defteri: `keys`.

Bir de: ok tuşları ve Boşluk normalde sayfayı kaydırır. Oyun sırasında bunu istemiyoruz.

# --code--

```js
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})
```

# --meaning--

- `keys[event.key] = true` sets the field named after the key, e.g. `keys.ArrowUp`; `keyup` sets it back to `false`.
- `startsWith('Arrow')` is true for every arrow key; `preventDefault()` stops the page from scrolling.

# --meaning-tr--

- `const keys = {}` → boş bir **not defteri** (nesne).
- `keys[event.key] = true` → adı basılan tuş olan alanı `true` yap. Köşeli parantez, alan adı bir değişkende
  durduğunda kullanılır: yukarı ok basılıyken `keys.ArrowUp` doğrudur.
- `event.key.startsWith('Arrow')` → tuşun adı `'Arrow'` ile mi başlıyor? Dört ok tuşu da öyle.
- `event.preventDefault()` → tarayıcının bu tuşla yapacağı **kendi işini** (sayfayı kaydırmak) engeller.
- `'keyup'` → tuş bırakılınca alanı `false` yap.

# --task--

1. Under `let state ...` write `const keys = {}`.
2. Above `function touchdown() {`, write the two listeners, followed by an empty line.

# --task-tr--

1. `let state ...` satırının altına `const keys = {}` yaz.
2. `function touchdown() {` satırının **üstüne** iki dinleyiciyi yaz; altlarında bir boş satır kalsın.
3. **Çalıştır**: henüz bir şey değişmez; kontroller yeşil olmalı.

# --tests--

`keys` should record which keys are held.
tr: `keys` hangi tuşların basılı olduğunu kaydetmeli.

```js
$.press('ArrowUp')
assert.isTrue(keys.ArrowUp)
$.release('ArrowUp')
assert.isFalse(keys.ArrowUp)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
let state // 'flying', 'landed' or 'crashed'
const keys = {}

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function reset() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }
  gravity = 0.025
  state = 'flying'
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function touchdown() {
  state = 'crashed'
}

function update() {
  if (state !== 'flying') return

  lander.vy += gravity
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()
}

function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
  ctx.restore()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)

  drawLander()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
