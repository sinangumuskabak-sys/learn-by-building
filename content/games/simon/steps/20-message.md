---
title: Progress and mistakes
title_tr: İlerleme ve hata
skills: [game.state]
---

# --goal--

The message now shows how far you are, `Your turn: 2/5`, and `Wrong! Click to retry` when the game is over.

# --goal-tr--

Sağ üstteki mesajı daha faydalı yapalım: sıra sendeyken **kaçta kaç** olduğunu (`Your turn: 2/5`, beşten ikisi tamam),
oyun bitince de `Wrong! Click to retry` (Yanlış! Yeniden denemek için tıkla) yazsın.

# --code--

```js
let message = state === 'showing' ? 'Watch...' : 'Your turn: ' + inputAt + '/' + sequence.length
if (state === 'over') message = 'Wrong! Click to retry'
ctx.fillText(message, canvas.width - 10, 27)
```

# --meaning--

- `message` is picked first, then replaced if the game is over, then written.
- `'Your turn: ' + inputAt + '/' + sequence.length` glues four parts: `'Your turn: 2/5'`.

# --meaning-tr--

- `let message = ...` → önce mesajı bir değişkene koyuyoruz: gösteri sürüyorsa `'Watch...'`, değilse ilerleme.
- `'Your turn: ' + inputAt + '/' + sequence.length` → dört parça yapıştırılır: `'Your turn: ' + 2 + '/' + 5` →
  `'Your turn: 2/5'`.
- `if (state === 'over') message = ...` → oyun bittiyse mesajın **yerine** başka bir yazı koy. `let` sayesinde değer
  değişebiliyor.
- `ctx.fillText(message, ...)` → hangisi seçildiyse onu yaz.

# --task--

In `draw`, replace the last `fillText` line with the three new lines.

# --task-tr--

`draw` içindeki son satırı (`ctx.fillText(state === 'showing' ? ...)`) sil; yerine üç yeni satırı yaz. **Çalıştır**, oyna ve bilerek yanlış bas: `Wrong! Click to retry` yazmalı.

# --hint--

Watch the spaces: `'Your turn: '` ends with a space, and `'/'` has none.

# --hint-tr--

Boşluklara dikkat: `'Your turn: '` bir boşlukla biter, `'/'` içinde boşluk yok.

# --tests--

The player's progress should be shown.
tr: Oyuncunun ilerlemesi gösterilmeli.

```js
sequence = [0, 3]
$.tick(200)
assert.strictEqual(state, 'input')
$.click(100, 100)
$.tick(1)
assert.include($.texts(), 'Your turn: 1/2')
```

A mistake should be shown.
tr: Hata gösterilmeli.

```js
sequence = [0, 3]
$.tick(200)
$.click(100, 100)
$.click(100, 100)
assert.strictEqual(state, 'over')
$.tick(1)
assert.include($.texts(), 'Wrong! Click to retry')
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

let sequence = [] // the pads to repeat, growing by one every round
let state // 'showing', 'input' or 'over'
let showAt // which step of the sequence is being shown, and when
let timer
let inputAt // how many pads of the sequence the player has repeated
let lit = -1 // the pad lit right now, or -1
let litFor = 0

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
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const pad = padAt(x, y)
  if (pad >= 0) press(pad)
})
document.addEventListener('keydown', (event) => {
  if (event.repeat) return
  if (event.key in KEYS) press(KEYS[event.key])
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

nextRound()
requestAnimationFrame(loop)
```
