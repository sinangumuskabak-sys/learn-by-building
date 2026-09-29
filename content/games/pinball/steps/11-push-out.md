---
title: Push the ball out
title_tr: Topu dışarı it
skills: [game.collision]
---

# --goal--

When the ball is inside a wall, we push it back out along the **normal**: the direction from the closest point to
the ball's centre. Then `update` checks every wall each frame.

# --goal-tr--

Top bir duvara girdiyse onu **dışarı itmeliyiz**. Ama hangi yöne? Cevap: en yakın noktadan topun merkezine doğru.
Bu yöne **normal** denir; duvardan dışarı, dik olarak bakan yön.

Topu bu yönde, duvara **tam değecek** kadar (uzaklık tam `R` olacak şekilde) geri koyuyoruz. Sonra `update` her
karede bütün duvarlar için `hitSegment`'i çağıracak.

# --code--

```js
if (d >= R || d === 0) return false
const nx = (ball.x - px) / d
const ny = (ball.y - py) / d
ball.x = px + nx * R
ball.y = py + ny * R
return true

ball.y += ball.vy
for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
```

# --meaning--

- `(ball.x - px, ball.y - py)` points from the wall to the ball; dividing by its length `d` makes it one pixel long.
  That is the normal `(nx, ny)`.
- `px + nx * R` is the point `R` pixels out from the wall along the normal: the ball now just touches.
- `update` calls `hitSegment` for every wall after moving; `w[0]` to `w[3]` are the wall's four numbers, and `0.5`
  is its springiness.

# --meaning-tr--

- `ball.x - px`, `ball.y - py` → en yakın noktadan topun merkezine giden ok. Uzunluğu `d`.
- `/ d` → oku kendi uzunluğuna bölmek onu **1 piksel uzunluğa** indirir: yalnız **yön** kalır. Bu yön `(nx, ny)`,
  yani **normal**. Duvar dikse normal tam yatay, yataysa tam dikey olur; eğik duvarda eğik.
- `ball.x = px + nx * R` → en yakın noktadan normal yönünde `R` piksel git ve topu oraya koy. Top artık duvara
  **tam değiyor**, içinde değil.
- `for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)` → her karede, top hareket ettikten **sonra**
  bütün duvarları dene. `w[0]` duvar dizisinin ilk sayısı (x1), `w[3]` dördüncüsü (y2); dizilerde sayma 0'dan başlar.
  Sondaki `0.5` duvarın esnekliği (`bounce`).

# --task--

1. In `hitSegment`, write the four lines between `if (d >= R ...` and `return true`.
2. In `update`, under `ball.y += ball.vy`, write the `for` line.

# --task-tr--

1. `hitSegment` içinde `if (d >= R || d === 0) return false` satırının **altına**, `return true` satırının
   **üstüne** dört satırı yaz.
2. `update` içinde `ball.y += ball.vy` satırının **altına** `for` satırını yaz.
3. **Çalıştır**, bir süre izle, sonra Boşluk'a bas.

# --predict--

Run and wait a second or two without pressing anything. What happens to the ball in the lane?
- [ ] It rests on the floor of the lane forever
- [x] It sits on the floor for a moment, then sinks through it
  Its speed `vy` keeps growing: it is pushed out, but never slowed down. Soon one frame's move is so big that it
  jumps past the line. The next step fixes this.
- [ ] It bounces up and down

# --predict-tr--

Çalıştır'a bas ve hiçbir şeye dokunmadan bir iki saniye bekle. Kanaldaki topa ne olur?
- [ ] Kanalın tabanında sonsuza kadar durur
- [x] Bir an tabanda durur, sonra tabanın içinden geçip düşer
  Hızı (`vy`) büyümeye devam ediyor: dışarı itiliyor ama hiç yavaşlatılmıyor. Bir süre sonra bir karelik hareket o
  kadar büyüyor ki çizginin öbür yanına atlıyor. Bir sonraki adım bunu düzeltecek.
- [ ] Aşağı yukarı zıplar

# --tests--

`hitSegment` should push the ball out until it just touches.
tr: `hitSegment` topu tam değecek kadar dışarı itmeli.

```js
ball = { x: 25, y: 300, vx: -5, vy: 0 }
assert.isTrue(hitSegment(20, 470, 20, 120, 0.5))
assert.strictEqual(ball.x, 28, 'pushed out of the left wall')
assert.strictEqual(ball.y, 300)
ball = { x: 20, y: 114, vx: 0, vy: 0 }
hitSegment(20, 470, 20, 120, 0.5)
assert.closeTo(ball.y, 112, 1e-9, 'past the end, pushed straight up')
```

Every frame the walls should keep the ball out.
tr: Her kare duvarlar topu dışarıda tutmalı.

```js
ball = { x: 385, y: 300, vx: 3, vy: 0 }
$.tick(1)
assert.closeTo(ball.x, 382, 1e-9, 'the right wall of the lane pushes it back')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  return true
}

function update() {
  ball.vy += GRAVITY
  ball.x += ball.vx
  ball.y += ball.vy
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
}

function launch() {
  ball.vy = -16
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
