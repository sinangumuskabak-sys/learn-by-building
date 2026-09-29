---
title: Light up when pressed
title_tr: Basınca yan
skills: [game.state]
---

# --goal--

A pressed pad should light up, just like when the computer shows it: it confirms the press, and your answer looks like
the sequence. Lighting is already one function, so it takes one line.

# --goal-tr--

Bir tuşa bastığında, tıpkı bilgisayar gösterirken olduğu gibi **yanmalı**. Bu, basışın yerine ulaştığını onaylar ve
cevabın, tekrarladığın diziye benzer.

Tuş yakmak zaten tek bir fonksiyon (`light`); basışa tek satır eklemek yeter. Doğru da bassan yanlış da, tuş yanar.

# --code--

```js
const PRESS_FRAMES = 12 // how long a pad the player pressed stays lit

  if (state !== 'input') return
  light(pad, PRESS_FRAMES)
```

# --meaning--

- `PRESS_FRAMES` is 12 frames, about a fifth of a second.
- The light comes right after the turn check, so it only happens in the player's turn.

# --meaning-tr--

- `const PRESS_FRAMES = 12` → basılan tuş 12 kare (yaklaşık beşte bir saniye) yanar.
- `light(pad, PRESS_FRAMES)` → `press` içinde, aşama kontrolünün **hemen altında**: yalnız oyuncunun sırasında yanar;
  gösteri sırasındaki basışlar hâlâ yok sayılır.
- Aynı `light` fonksiyonunu hem bilgisayar hem oyuncu kullanıyor: `lit` değişir, `update` söndürür, `draw` gösterir.

# --task--

1. Under `KEYS`, write `PRESS_FRAMES`.
2. In `press`, under the first line, write the `light` line.

# --task-tr--

1. `KEYS` satırının altına `PRESS_FRAMES` satırını yaz.
2. `press` içinde `if (state !== 'input') return` satırının **altına** `light(pad, PRESS_FRAMES)` yaz.
3. **Çalıştır** ve oyna: bastığın tuş kısa bir an parlamalı.

# --tests--

A pressed pad should light up for 12 frames.
tr: Basılan tuş 12 kare yanmalı.

```js
$.tick(200)
assert.strictEqual(state, 'input')
const pad = sequence[0]
press(pad)
assert.strictEqual(lit, pad)
$.tick(11)
assert.strictEqual(lit, pad)
$.tick(1)
assert.strictEqual(lit, -1)
```

A wrong pad should light up too, and presses during the show should not.
tr: Yanlış tuş da yanmalı; gösteri sırasındaki basışlar yanmamalı.

```js
press(sequence[0])
assert.strictEqual(lit, -1)
$.tick(200)
press((sequence[0] + 1) % 4)
assert.strictEqual(lit, (sequence[0] + 1) % 4)
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
  timer = 40 // a short pause before the sequence is shown
  inputAt = 0
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

function press(pad) {
  if (state !== 'input') return
  light(pad, PRESS_FRAMES)
  if (pad !== sequence[inputAt]) {
    state = 'over'
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
  if (state !== 'showing') return
  timer -= 1
  if (timer > 0) return
  if (showAt === sequence.length) {
    state = 'input'
    return
  }
  // Light the next pad, then wait a little longer than it stays lit, so repeats are two separate flashes.
  light(sequence[showAt], 30)
  showAt += 1
  timer = 30 + 8
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
  if (state === 'over') message = 'Wrong! Click to retry'
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
