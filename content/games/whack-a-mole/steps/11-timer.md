---
title: Time's running
title_tr: Süre işliyor
skills: [game.state, game.loop]
---

# --goal--

The seconds left are shown on the right, and when the time is up the round is over and the moles hide.

# --goal-tr--

Kalan **saniye** sağ üstte görünsün; süre bitince tur **biter** ve köstebekler saklanır.

# --code--

```js
if (now >= endsAt) {
  state = 'over'
  for (const hole of holes) hole.upUntil = 0
  return
}

if (state === 'playing') {
  ctx.textAlign = 'right'
  ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
}
```

# --meaning--

- When `now` reaches `endsAt`, the state becomes `'over'` and every hole is emptied.
- `(endsAt - now) / 1000` is the seconds left; `Math.ceil` rounds up, so 0.3 seconds still shows as 1.
- `textAlign = 'right'` lines the time up against the right edge.

# --meaning-tr--

- `if (now >= endsAt)` → süre doldu mu? Dolduysa durum `'over'`, bütün delikler boş, `return`.
- `(endsAt - now) / 1000` → kalan milisaniyeyi saniyeye çevir.
- `Math.ceil(...)` → **yukarı** yuvarlar: 0,3 saniye kaldıysa yine 1 görünür; 0 ancak süre gerçekten bitince.
- `ctx.textAlign = 'right'` → yazı verilen noktada **biter**: sağ kenardan 12 piksel içeride.

# --task--

1. In `update`, under the first line, write the time-up block.
2. In `draw`, under the Score line, write the time block.

# --task-tr--

1. `update` içinde `if (state !== 'playing') return` satırının altına süre bitti bloğunu yaz.
2. `draw` içinde `Score` satırının altına süre bloğunu yaz.
3. **Çalıştır**, tıkla ve 30 saniye bekle.

# --tests--

The timer should count down in whole seconds, rounded up.
tr: Süre yukarı yuvarlanmış tam saniyelerle geri saymalı.

```js
$.pointerDown(180, 220)
$.tick()
assert.include($.texts(), 'Time: 30')
$.run(29.5)
assert.include($.texts(), 'Time: 1')
```

After 30 seconds the round should end and the moles hide.
tr: 30 saniye sonra tur bitmeli ve köstebekler saklanmalı.

```js
$.pointerDown(180, 220)
$.run(30.2)
assert.strictEqual(state, 'over')
assert.strictEqual(holes.filter(isUp).length, 0)
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
const ROUND = 30000 // a round lasts 30 seconds

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0
let state = 'ready' // 'ready', 'playing' or 'over'
let endsAt = 0

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

function start() {
  state = 'playing'
  score = 0
  endsAt = now + ROUND
  nextPop = now
  for (const hole of holes) hole.upUntil = 0
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') {
    start()
    return
  }
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
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    return
  }
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
  if (state === 'playing') {
    ctx.textAlign = 'right'
    ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
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
