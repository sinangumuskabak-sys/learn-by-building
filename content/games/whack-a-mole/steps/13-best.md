---
title: Best score
title_tr: En iyi skor
skills: [game.state]
---

# --goal--

The best score is kept in the browser's `localStorage`, so it survives a reload, and shown before and after a round.

# --goal-tr--

En iyi skoru tarayıcının küçük not defterinde, `localStorage`'da tutalım; sayfa kapansa da kalsın. Tur başlamadan önce
ve bittikten sonra görünsün.

# --code--

```js
let best = Number(localStorage.getItem('mole-best')) || 0

    if (score > best) {
      best = score
      localStorage.setItem('mole-best', best)
    }

    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, canvas.height / 2 + 28)

    ctx.fillText('Best: ' + best, canvas.width / 2, 252)
```

# --meaning--

- `getItem` reads the saved text (`null` the first time), `Number(...)` turns it into a number and `|| 0` falls back to 0.
- When a round ends with a higher score, `best` is updated and saved with `setItem`.

# --meaning-tr--

- `localStorage.getItem('mole-best')` → not defterinden `mole-best` kaydını oku; ilk seferde yoktur, `null` gelir.
- `Number(...)` → kayıtlar hep yazıdır; sayıya çevir. `|| 0` → bir şey çıkmazsa 0.
- `if (score > best)` → tur bittiğinde skor rekordan büyükse yeni rekor; `setItem` ile kaydet.
- İki yeni `fillText` → rekoru hazır ekranında "Click to start"ın altında, bitiş ekranında skorun altında göster.

# --task--

1. Under `let endsAt`, write the `best` line.
2. In `update`, save the record in the time-up block, before `return`.
3. In `draw`, add a Best line to the `ready` block and to the `over` block.

# --task-tr--

1. `let endsAt = 0` satırının altına `best` satırını yaz.
2. `update` içindeki süre bitti bloğunda, `return`'den önce rekor bloğunu yaz.
3. `draw`'da `ready` bloğuna "Click to start"ın altına iki satır; `over` bloğuna `'Click to play again'` satırının üstüne
   Best satırını ekle.
4. **Çalıştır**.

# --tests--

A new best score should be saved at the end of a round.
tr: Tur sonunda yeni rekor kaydedilmeli.

```js
$.pointerDown(180, 220)
score = 9
$.run(30.2)
assert.strictEqual(best, 9)
assert.strictEqual(localStorage.getItem('mole-best'), '9')
assert.include($.texts(), 'Best: 9')
```

The best score should be shown before a round.
tr: Rekor tur başlamadan önce görünmeli.

```js
$.tick()
assert.include($.texts(), 'Best: 0')
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
