---
title: Remember each hit
title_tr: Her vuruşu hatırla
skills: [prog.arrays]
---

# --goal--

A hit should feel good: a "+1" will float up from the mole. First we keep a list of them: each hit adds one with its
place and the time it was born, and each one is forgotten after 600 ms.

# --goal-tr--

Vuruş **hissettirmeli**: köstebeğin üstünden bir "+1" yükselip kaybolsun. Önce onların **listesini** tutalım: her
vuruş listeye bir tane ekler (yeri ve **doğduğu an**), her biri 600 ms sonra listeden çıkar. Çizmek sonraki adımda.

# --code--

```js
let popups = [] // floating "+1"s: { x, y, born }

  popups = []

    popups.push({ x: hole.x, y: hole.y - 40, born: now })

  popups = popups.filter((p) => now - p.born < 600)
```

# --meaning--

- Each popup remembers where it starts (just above the mole) and `born`, the time of the hit.
- `filter` keeps only the ones younger than 600 ms; it runs even when not playing, so the last ones still fade out.

# --meaning-tr--

- `popups.push({ x: hole.x, y: hole.y - 40, born: now })` → vurulan köstebeğin 40 piksel üstünde, **şu an** doğmuş bir
  "+1".
- `popups.filter((p) => now - p.born < 600)` → yaşı (`now - p.born`) 600 ms'den küçük olanları **tut**, gerisini at.
- Bu satır `if (state !== 'playing') return`'den **önce**: tur bitse de son "+1"ler sönüp gitsin.
- `start` içinde `popups = []` → yeni turda eski "+1"ler olmasın.

# --task--

1. Under `let best`, write `let popups`.
2. In `start`, empty the list; in the listener, add a popup on a hit.
3. Make the `filter` line the first line of `update`.

# --task-tr--

1. `let best ...` satırının altına `let popups ...` yaz.
2. `start` içinde `nextPop = now` satırının altına `popups = []` yaz.
3. `pointerdown` içindeki isabet bloğunda `hole.upUntil = 0` satırının altına `popups.push(...)` yaz.
4. `update`'in **ilk satırı** `filter` satırı olsun (`if (state !== 'playing') return`'ün üstüne).
5. **Çalıştır**.

# --tests--

A hit should add a popup above the mole.
tr: Bir vuruş köstebeğin üstüne bir popup eklemeli.

```js
$.pointerDown(180, 220)
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
assert.lengthOf(popups, 1)
assert.strictEqual(popups[0].x, 180)
assert.strictEqual(popups[0].y, 180)
```

Popups should be forgotten after 600 ms.
tr: Popup'lar 600 ms sonra unutulmalı.

```js
$.pointerDown(180, 220)
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
$.run(0.5)
assert.lengthOf(popups, 1)
$.run(0.2)
assert.lengthOf(popups, 0)
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
let best = Number(localStorage.getItem('mole-best')) || 0
let popups = [] // floating "+1"s: { x, y, born }

function isUp(hole) {
  return now < hole.upUntil
}

// 0 when the round starts, 1 when it ends.
function progress() {
  return Math.min(1, Math.max(0, 1 - (endsAt - now) / ROUND))
}

// Linear interpolation from the easy value to the hard value as the round goes on.
function upTime() {
  return 1000 - 500 * progress()
}

function popGap() {
  return 700 - 350 * progress()
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
  popups = []
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
    popups.push({ x: hole.x, y: hole.y - 40, born: now })
  }
})

function update() {
  popups = popups.filter((p) => now - p.born < 600)
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    if (score > best) {
      best = score
      localStorage.setItem('mole-best', best)
    }
    return
  }
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + upTime()
    }
    nextPop = now + popGap()
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
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, canvas.height / 2 + 28)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 150)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, 252)
    ctx.fillText('Click to play again', canvas.width / 2, 282)
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
