---
title: "Build it yourself: no dawdling"
title_tr: "Kendin yap: oyalanmak yok"
skills: [game.state, game.loop]
---

# --goal--

Your game, your idea. Add a strict rule: in your turn, if you wait more than 3 seconds (180 frames) without pressing,
you lose, just like a wrong press.

# --goal-tr--

Oyun senin! Katı bir kural ekle: sıra sendeyken **3 saniyeden** (180 kare) uzun süre hiçbir tuşa basmazsan, yanlış
basmış gibi **kaybedersin**.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir sayaç, `update`'teki geri sayım fikri, `state`, `press`...
Kontroller çalıştığında yeşile döner.

# --task--

In the player's turn, count the frames since the last press (or since the turn began). After about 180 frames without a
press, the game is over. The show does not count, and every press starts the count again.

# --task-tr--

- Yalnız **oyuncunun sırasında** (`'input'`) kare say: son basıştan (ya da sıranın başından) beri kaç kare geçti?
- 180 kareyi (3 saniye) geçerse oyun bitsin (`state` `'over'` olsun, rekor da yanlış basıştaki gibi kaydedilebilir).
- Her basış sayacı sıfırlasın; gösteri sırasında sayaç işlemesin.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

A variable like `idle` works: add 1 to it in `update` while the state is `'input'`, set it to 0 in `press` and when a
round starts, and end the game when it passes 180.

# --hint-tr--

`idle` (boşta) gibi bir değişken işini görür: `update` içinde durum `'input'` iken her karede 1 artır; `press` içinde ve
yeni tur başlarken 0 yap; 180'i geçince oyunu bitir. Kısa yol: süre dolunca `press(-1)` çağırırsan, `-1` hiçbir zaman
doğru tuş olmadığı için yanlış basış gibi sayılır ve rekor da kaydedilir.

# --tests--

Waiting too long in your turn should end the game.
tr: Sırandayken fazla beklemek oyunu bitirmeli.

```js
for (let i = 0; i < 500 && state !== 'input'; i++) $.tick(1)
assert.strictEqual(state, 'input')
$.tick(150)
assert.strictEqual(state, 'input', 'two and a half seconds is still fine')
$.tick(60)
assert.strictEqual(state, 'over')
```

Every press should start the count again.
tr: Her basış sayımı yeniden başlatmalı.

```js
sequence = [0, 1]
for (let i = 0; i < 500 && state !== 'input'; i++) $.tick(1)
$.tick(150)
press(0)
$.tick(150)
assert.strictEqual(state, 'input')
press(1)
assert.strictEqual(state, 'showing')
```

The show should not count, even when it is long.
tr: Gösteri, uzun olsa bile sayılmamalı.

```js
sequence = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]
$.tick(200)
assert.strictEqual(state, 'showing')
for (let i = 0; i < 500 && state !== 'input'; i++) $.tick(1)
$.tick(100)
assert.strictEqual(state, 'input')
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]
const KEYS = { q: 0, w: 1, a: 2, s: 3, 1: 0, 2: 1, 3: 2, 4: 3 }
const PRESS_FRAMES = 12 // how long a pad the player pressed stays lit

let sequence // the pads to repeat, growing by one every round
let state // 'showing', 'input' or 'over'
let showAt // which step of the sequence is being shown, and when
let timer
let inputAt // how many pads of the sequence the player has repeated
let lit // the pad lit right now, or -1
let litFor
let best = Number(localStorage.getItem('simon-best')) || 0
let idle = 0 // frames since the player's last press

function reset() {
  sequence = []
  lit = -1
  litFor = 0
  nextRound()
}

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
  showAt = 0
  idle = 0
  timer = 40 // a short pause before the sequence is shown
  inputAt = 0
}

// Longer sequences are shown faster, down to a limit.
function showFrames() {
  return Math.max(12, 30 - sequence.length * 2)
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function press(pad) {
  if (state !== 'input') return
  idle = 0
  light(pad, PRESS_FRAMES)
  if (pad !== sequence[inputAt]) {
    state = 'over'
    const score = sequence.length - 1
    if (score > best) {
      best = score
      localStorage.setItem('simon-best', best)
    }
    return
  }
  inputAt += 1
  if (inputAt === sequence.length) nextRound()
}

function padAt(x, y) {
  if (y < TOP) return -1
  return (y - TOP < HALF ? 0 : 2) + (x < HALF ? 0 : 1)
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const pad = padAt(x, y)
  if (pad >= 0) press(pad)
})
document.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (event.key in KEYS) press(KEYS[event.key])
  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
})

function update() {
  if (litFor > 0) {
    litFor -= 1
    if (litFor === 0) lit = -1
  }
  if (state === 'input') {
    idle += 1
    if (idle > 180) press(-1) // waited too long: counts as a wrong press
  }
  if (state !== 'showing') return
  timer -= 1
  if (timer > 0) return
  if (showAt === sequence.length) {
    state = 'input'
    return
  }
  // Light the next pad, then wait a little longer than it stays lit, so repeats are two separate flashes.
  light(sequence[showAt], showFrames())
  showAt += 1
  timer = showFrames() + 8
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  PADS.forEach((pad, i) => {
    const x = (i % 2) * HALF
    const y = TOP + Math.floor(i / 2) * HALF
    ctx.fillStyle = i === lit ? pad.lit : pad.dim
    ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
  })

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Round ' + sequence.length, 10, 27)
  ctx.textAlign = 'right'
  let message = state === 'showing' ? 'Watch...' : 'Your turn: ' + inputAt + '/' + sequence.length
  if (state === 'over') message = 'Wrong! Best ' + best + '. Click to retry'
  ctx.fillText(message, canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
