---
title: A difficulty curve
title_tr: Zorluk eğrisi
skills: [game.state, prog.functions]
---

# --explanation--

A good round starts easy and ends frantic. Two numbers control how hard Whack-a-Mole is: how long a mole stays up,
and how often a new one appears. Instead of constants, make them **functions of progress**.

First, measure progress as a number from `0` (round just started) to `1` (round over):

```js
const progress = 1 - (endsAt - now) / ROUND
```

Then **interpolate** each setting between its easy and hard value:

```js
upTime = 1000 - 500 * progress   // 1000 ms at the start → 500 ms at the end
gap    = 700  - 350 * progress   //  700 ms at the start → 350 ms at the end
```

This is linear interpolation, usually called **lerp**: `start + (end - start) * t`. It is the same idea as the
normalized paddle offset in Pong, used the other way round: turn a `0…1` value back into a real setting. Designers tune
games by adjusting the two ends of each lerp.

The best score is kept in `localStorage`, as in the other games, and shown on the ready and game-over screens.

# --explanation-tr--

İyi bir tur kolay başlar ve telaşlı biter. Köstebek Vurmaca'nın ne kadar zor olduğunu iki sayı belirler: bir
köstebeğin ne kadar yukarıda kaldığı ve ne sıklıkla yenisinin çıktığı. Sabitler yerine onları **ilerlemenin
fonksiyonları** yap.

Önce ilerlemeyi `0` (tur az önce başladı) ile `1` (tur bitti) arasında bir sayı olarak ölç:

```js
const progress = 1 - (endsAt - now) / ROUND
```

Sonra her ayarı kolay ve zor değeri arasında **ara değerle**:

```js
upTime = 1000 - 500 * progress   // başta 1000 ms → sonda 500 ms
gap    = 700  - 350 * progress   // başta  700 ms → sonda 350 ms
```

Buna doğrusal ara değerleme denir, genelde **lerp**: `başlangıç + (bitiş - başlangıç) * t`. Pong'daki normalleştirilmiş
raket konumuyla aynı fikir, ters yönde kullanılmış: `0…1` arası bir değeri gerçek bir ayara geri çevir. Tasarımcılar
oyunları her lerp'in iki ucunu ayarlayarak ince ayarlar.

Rekor, diğer oyunlardaki gibi `localStorage`'da tutulur ve hazır ile oyun sonu ekranlarında gösterilir.

# --task--

1. Write `function progress()` that returns `1 - (endsAt - now) / ROUND`, limited to `0…1`.
2. Write `function upTime()` returning `1000 - 500 * progress()` and `function popGap()` returning
   `700 - 350 * progress()`, and use them instead of the fixed `1000` and `700`.
3. Add `let best = Number(localStorage.getItem('mole-best')) || 0`. When a round ends with a higher score, save it
   under `'mole-best'`.
4. Draw `Best: 20` under the other text on the ready and game-over screens.

# --task-tr--

1. `0…1` aralığıyla sınırlanmış `1 - (endsAt - now) / ROUND` döndüren `function progress()` yaz.
2. `1000 - 500 * progress()` döndüren `function upTime()` ve `700 - 350 * progress()` döndüren `function popGap()`
   yaz; sabit `1000` ve `700` yerine onları kullan.
3. `let best = Number(localStorage.getItem('mole-best')) || 0` ekle. Tur daha yüksek bir skorla bitince onu
   `'mole-best'` altında kaydet.
4. Hazır ve oyun sonu ekranlarında diğer yazıların altına `Best: 20` çiz.

# --tests--

`progress()` should go from 0 to 1 over the round.
tr: `progress()` tur boyunca 0'dan 1'e gitmeli.

```js
$.pointerDown(180, 220)
assert.closeTo(progress(), 0, 0.001)
$.run(15)
assert.closeTo(progress(), 0.5, 0.01)
now = endsAt + 5000
assert.strictEqual(progress(), 1)
```

Moles should stay up for less time and appear more often as the round goes on.
tr: Tur ilerledikçe köstebekler daha kısa süre kalmalı ve daha sık çıkmalı.

```js
$.pointerDown(180, 220)
assert.closeTo(upTime(), 1000, 1)
assert.closeTo(popGap(), 700, 1)
$.run(30 * 0.8)
assert.closeTo(upTime(), 600, 2)
assert.closeTo(popGap(), 420, 2)
const up = holes.find(isUp)
if (up) assert.isAtMost(up.upUntil - now, 700, 'a new mole late in the round is up for less time')
```

More moles should pop up in the second half than in the first.
tr: İkinci yarıda ilkinden daha çok köstebek çıkmalı.

```js
$.pointerDown(180, 220)
let first = 0
let second = 0
const seen = new Set()
for (let frame = 0; frame < 30 * 60 - 5; frame++) {
  $.tick()
  for (const hole of holes) {
    if (isUp(hole) && !seen.has(hole.upUntil)) {
      seen.add(hole.upUntil)
      if (progress() < 0.5) first++
      else second++
    }
  }
}
assert.isAbove(second, first + 5)
```

A new best score should be saved when the round ends.
tr: Tur bitince yeni rekor kaydedilmeli.

```js
$.pointerDown(180, 220)
score = 23
$.run(31)
assert.strictEqual(best, 23)
assert.strictEqual(localStorage.getItem('mole-best'), '23')
assert.include($.texts(), 'Best: 23')
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
