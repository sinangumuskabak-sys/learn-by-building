---
title: Faster and faster
title_tr: Gittikçe hızlan
skills: [game.state, prog.functions]
---

# --goal--

Half a second per pad is fine at first, but boring by round ten. `showFrames()` makes the show faster as the sequence
grows, but never faster than 12 frames per pad.

# --goal-tr--

Her tuşu yarım saniye göstermek başta iyi, ama onuncu turda sıkıcı olur. Dizi uzadıkça gösteriyi **hızlandıracağız**;
ama oyuncunun takip edemeyeceği kadar değil.

Süre artık tura göre değiştiği için sabit bir `30` yerine her seferinde **hesaplayan bir fonksiyon** kullanacağız:
`showFrames`.

# --code--

```js
// Longer sequences are shown faster, down to a limit.
function showFrames() {
  return Math.max(12, 30 - sequence.length * 2)
}

  light(sequence[showAt], showFrames())
  showAt += 1
  timer = showFrames() + 8
```

# --meaning--

- `30 - sequence.length * 2` gets smaller every round: 28 frames in round 1, 20 in round 5.
- `Math.max(12, ...)` picks the bigger number, so it never goes under 12: a floor.
- `showFrames()` returns a number, so it can stand where `30` stood.

# --meaning-tr--

- `sequence.length * 2` → tur numarasının iki katı. `30 -` bunu 30'dan çıkarır: 1. turda 28, 5. turda 20 kare.
- `Math.max(a, b)` → iki sayıdan **büyüğünü** verir. `Math.max(12, ...)` "ama asla 12'nin altına inme": bir **taban**.
  9. turdan sonra hep 12.
- `return` → hesaplanan sayıyı geri verir. Değer döndüren bir fonksiyon, yazıldığı yerde **bir sayı gibi** davranır;
  bu yüzden `30` yazan yerlere `showFrames()` yazabiliyoruz.
- Oyuncunun ilerlemesiyle artan ama tabanı olan bir zorluk, oyunları eğlenceli tutan bir fikirdir.

# --task--

1. Under `nextRound`, leave an empty line and write the comment and `showFrames`.
2. At the end of `update`, replace the two `30`s with `showFrames()`.

# --task-tr--

1. `nextRound` fonksiyonunun altına bir boş satır bırak ve yorum satırıyla `showFrames`'i yaz (`function light`'ın üstünde).
2. `update`'in sonundaki `light(sequence[showAt], 30)` satırında `30` yerine `showFrames()` yaz.
3. `timer = 30 + 8` satırını `timer = showFrames() + 8` yap.
4. **Çalıştır** ve birkaç tur oyna: gösteri hızlanmalı.

# --try--

Try `Math.max(6, 30 - sequence.length * 4)` for a much harder game. Put the old line back.

# --try-tr--

Çok daha zor bir oyun için `Math.max(6, 30 - sequence.length * 4)` dene. Sonra eski satırı geri yaz.

# --tests--

Longer sequences should be shown faster, down to 12 frames.
tr: Daha uzun diziler 12 kareye kadar daha hızlı gösterilmeli.

```js
assert.strictEqual(showFrames(), 28)
sequence = [0, 1, 2, 3, 0]
assert.strictEqual(showFrames(), 20)
sequence = Array(20).fill(1)
assert.strictEqual(showFrames(), 12)
```

The show should use the faster timing.
tr: Gösteri daha hızlı zamanlamayı kullanmalı.

```js
sequence = [0, 1, 2, 3, 0]
$.tick(40)
assert.strictEqual(lit, 0)
$.tick(19)
assert.strictEqual(lit, 0)
$.tick(1)
assert.strictEqual(lit, -1)
$.tick(8)
assert.strictEqual(lit, 1)
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
