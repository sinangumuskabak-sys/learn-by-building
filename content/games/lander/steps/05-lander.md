---
title: The lander
title_tr: İniş aracı
skills: [game.state]
---

# --goal--

The lander has a position, a velocity and an angle. `reset()` makes new hills and puts a new lander in the sky.

# --goal-tr--

Sıra iniş aracında (lander). Aracın bilgileri bir nesnede: **konumu** (`x`, `y`), **hızı** (`vx`, `vy`: her karede
ne kadar yer değiştireceği) ve **açısı** (`angle`: ne kadar eğik olduğu). Araç sol üstte, hafifçe sağa kayarak
başlayacak.

Yeni bir uçuşu başlatan işleri `reset` (sıfırla) adlı bir fonksiyonda topluyoruz: yeni tepeler ve yeni bir araç.
Araç bu adımda henüz görünmeyecek.

# --code--

```js
let lander

function reset() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }
}

reset()
draw()
```

# --meaning--

- `lander` starts at (60, 40), moving 1 pixel right per frame and not falling yet; `angle` 0 means upright.
- `reset()` replaces the `makeGround()` call at the bottom: it makes the ground and the lander.

# --meaning-tr--

- `let lander` → iniş aracının nesnesi.
- `lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }` → sol üstte (60, 40); `vx: 1` her karede 1 piksel **sağa**;
  `vy: 0` henüz düşmüyor; `angle: 0` **dik** duruyor (açılar radyanla, birazdan).
- `reset()` → yeni bir uçuş: önce tepeler, sonra araç. En alttaki `makeGround()` çağrısının yerini alır.

# --task--

1. Under `let pad ...` write `let lander`.
2. Leave an empty line under `groundY` and write `reset`.
3. At the bottom, replace `makeGround()` with `reset()`.

# --task-tr--

1. `let pad ...` satırının altına `let lander` yaz.
2. `groundY` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `reset` fonksiyonunu yaz.
3. En alttaki `makeGround()` satırını `reset()` yap.
4. **Çalıştır**: tepeler yine görünmeli; kontroller yeşil olmalı.

# --tests--

The lander should start at the top left, drifting right.
tr: Araç sol üstte, sağa kayarak başlamalı.

```js
assert.deepEqual(lander, { x: 60, y: 40, vx: 1, vy: 0, angle: 0 })
```

`reset()` should make new hills and a new lander.
tr: `reset()` yeni tepeler ve yeni bir araç yapmalı.

```js
const old = ground
lander.x = 300
reset()
assert.notStrictEqual(ground, old)
assert.strictEqual(lander.x, 60)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander

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
}

reset()
draw()
```
