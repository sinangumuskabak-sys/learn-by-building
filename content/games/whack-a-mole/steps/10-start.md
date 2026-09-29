---
title: Click to start
title_tr: Başlamak için tıkla
skills: [game.state]
---

# --goal--

A game is a 30-second round. Before it starts, the field waits with "Click to start"; the first click calls `start`,
which sets everything up for a new round.

# --goal-tr--

Oyun **30 saniyelik** bir tur olacak. Tur başlamadan çayır "Click to start" (başlamak için tıkla) yazısıyla beklesin;
ilk tıklama turu başlatan `start` fonksiyonunu çağırsın.

Oyunun bir **durumu** var: `'ready'` (hazır), `'playing'` (oynanıyor), `'over'` (bitti). Köstebekler yalnız
`'playing'` sırasında çıkar.

# --code--

```js
const ROUND = 30000 // a round lasts 30 seconds
let state = 'ready' // 'ready', 'playing' or 'over'
let endsAt = 0

function start() {
  state = 'playing'
  score = 0
  endsAt = now + ROUND
  nextPop = now
  for (const hole of holes) hole.upUntil = 0
}

  if (state !== 'playing') {
    start()
    return
  }

  if (state !== 'playing') return

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
  }
```

# --meaning--

- `endsAt` is the time the round ends: 30 000 ms after the start.
- `start` resets the score, sets the end time, makes the first mole come at once and empties the holes.
- A click when not playing starts a round and does nothing else; `update` does nothing unless playing.

# --meaning-tr--

- `ROUND` → turun süresi: 30 000 ms = 30 saniye.
- `let state = 'ready'` → başta "hazır". `let endsAt = 0` → turun biteceği zaman.
- `function start()` → yeni tur: durum `'playing'`, skor 0, `endsAt = now + ROUND` (şu andan 30 sn sonra),
  `nextPop = now` (ilk köstebek hemen), bütün delikler boş.
- `pointerdown` başında: oyun oynanmıyorsa `start()` ve `return` → bu tıklama tur başlatır, köstebek vurmaz.
- `update` başında: oynanmıyorsa hiçbir şey yapma; köstebek çıkmaz.
- `if (state === 'ready')` → hazır durumunda ortaya yazı.

# --task--

1. Under `HOLE_R`, write `ROUND`; under `let score`, write `state` and `endsAt`.
2. Above the `pointerdown` listener, write `start`; at the top of the listener, write the start check.
3. Make `if (state !== 'playing') return` the first line of `update`.
4. At the end of `draw`, write the centered "Click to start" block.

# --task-tr--

1. `const HOLE_R = 40` satırının altına `ROUND`; `let score = 0` satırının altına `state` ve `endsAt` satırlarını yaz.
2. `pointerdown` dinleyicisinin üstüne `start` fonksiyonunu yaz; dinleyicinin **ilk satırlarına** başlatma kontrolünü
   yaz.
3. `update`'in ilk satırı `if (state !== 'playing') return` olsun.
4. `draw`'ın sonuna, bir boş satırdan sonra ortalanmış "Click to start" bloğunu yaz.
5. **Çalıştır** ve tıkla.

# --tests--

Nothing should happen until the first click.
tr: İlk tıklamaya kadar hiçbir şey olmamalı.

```js
$.run(2)
assert.strictEqual(state, 'ready')
assert.strictEqual(holes.filter(isUp).length, 0)
assert.include($.texts(), 'Click to start')
```

The first click should start a 30-second round without scoring.
tr: İlk tıklama puan vermeden 30 saniyelik bir tur başlatmalı.

```js
$.run(1)
$.pointerDown(180, 220)
assert.strictEqual(state, 'playing')
assert.closeTo(endsAt - now, 30000, 1)
assert.strictEqual(score, 0)
$.tick()
assert.strictEqual(holes.filter(isUp).length, 1)
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
