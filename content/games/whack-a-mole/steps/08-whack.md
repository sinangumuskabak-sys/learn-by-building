---
title: Whack!
title_tr: Vur!
skills: [game.input]
---

# --goal--

A click on a hole whose mole is up scores a point and sends the mole back down at once.

# --goal-tr--

Köstebeği dışarıda olan bir deliğe **tıklamak** bir puan kazandırsın ve köstebeği hemen deliğine geri yollasın.

# --code--

```js
let score = 0

canvas.addEventListener('pointerdown', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
  }
})
```

# --meaning--

- `pointerdown` fires when a mouse button or a finger goes down on the canvas.
- The event's position is in page pixels; subtracting the canvas's position and scaling gives canvas pixels.
- A hit adds a point and sets `upUntil` to 0, which hides the mole.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → canvas'a fare ya da parmakla **basıldığında** çalışır.
- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki yeri ve **ekrandaki** boyu.
- `(event.clientX - rect.left)` → tıklamanın canvas'ın sol kenarına uzaklığı (sayfa pikseli).
- `* (canvas.width / rect.width)` → canvas ekranda küçültülmüş ya da büyütülmüş olabilir; bu oran onu canvas'ın kendi
  piksellerine çevirir.
- `if (hole && isUp(hole))` → bir deliğe tıklandı **ve** köstebeği dışarıda: `score += 1`, `hole.upUntil = 0`
  (köstebek hemen saklanır).

# --task--

1. Under `let nextPop`, write `let score = 0`.
2. Above `update`, write the `pointerdown` listener.

# --task-tr--

1. `let nextPop ...` satırının altına `let score = 0` yaz.
2. `function update() {` satırının üstüne `pointerdown` dinleyicisini yaz.
3. **Çalıştır** ve köstebeklere tıkla. (Skoru sonraki adımda ekranda göreceğiz.)

# --tests--

Clicking an up mole should score a point and hide it.
tr: Dışarıdaki bir köstebeğe tıklamak puan kazandırmalı ve onu saklamalı.

```js
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
assert.strictEqual(score, 1)
assert.isFalse(isUp(holes[4]))
```

Clicking an empty hole or the grass should score nothing.
tr: Boş bir deliğe ya da çimene tıklamak puan kazandırmamalı.

```js
for (const hole of holes) hole.upUntil = 0
$.pointerDown(180, 220)
$.pointerDown(120, 160)
assert.strictEqual(score, 0)
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0

function isUp(hole) {
  return now < hole.upUntil
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

canvas.addEventListener('pointerdown', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
  }
})

function update() {
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + 1000
    }
    nextPop = now + 700
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
