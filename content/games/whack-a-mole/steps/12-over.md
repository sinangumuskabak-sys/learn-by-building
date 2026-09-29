---
title: Time's up
title_tr: Süre bitti
skills: [game.canvas]
---

# --goal--

At the end of a round a dark band across the field shows the result. A click starts a new round (that already works:
any click while not playing calls `start`).

# --goal-tr--

Tur bitince çayırın ortasına koyu, yarı saydam bir **bant** çekip sonucu yazalım. Tekrar oynamak için tıklamak zaten
çalışıyor: oyun oynanmıyorken her tıklama `start`'ı çağırıyor.

# --code--

```js
if (state === 'over') {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 150, canvas.width, 150)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 30px sans-serif'
  ctx.fillText("Time's up!", canvas.width / 2, 190)
  ctx.font = '20px sans-serif'
  ctx.fillText('Score: ' + score, canvas.width / 2, 225)
  ctx.font = '16px sans-serif'
  ctx.fillText('Click to play again', canvas.width / 2, 282)
}
```

# --meaning--

- `rgba(0, 0, 0, 0.6)` is black at 60%, so the field shows faintly through the band.
- `"Time's up!"` uses double quotes because the text contains an apostrophe.

# --meaning-tr--

- `rgba(0, 0, 0, 0.6)` → %60 koyulukta siyah: bant yarı saydam, altındaki çayır seçilir.
- `ctx.fillRect(0, 150, canvas.width, 150)` → boydan boya, 150 piksel yüksekliğinde bant.
- `"Time's up!"` → metnin içinde kesme işareti (`'`) olduğu için **çift tırnak** kullanıyoruz; tek tırnak kullansaydık
  metin orada biterdi.
- Her satır farklı boyda yazı: başlık büyük, skor orta, yardım küçük.

# --task--

At the end of `draw`, under the `ready` block, write the `over` block.

# --task-tr--

`draw`'ın sonunda, `if (state === 'ready')` bloğunun altına `over` bloğunu yaz. **Çalıştır** ve bir turu bitir.

# --tests--

The end of the round should show the result.
tr: Tur sonunda sonuç görünmeli.

```js
state = 'over'
score = 12
$.tick()
assert.include($.texts(), "Time's up!")
assert.include($.texts(), 'Score: 12')
assert.include($.texts(), 'Click to play again')
```

A click after the round should start a new one.
tr: Tur bitince tıklamak yenisini başlatmalı.

```js
state = 'over'
score = 12
$.pointerDown(100, 100)
assert.strictEqual(state, 'playing')
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
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 150)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
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
