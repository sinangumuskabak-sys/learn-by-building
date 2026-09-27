---
title: Feedback and speed
title_tr: Geri bildirim ve hız
skills: [game.state]
---

# --explanation--

Two small changes make the game feel much better.

**Feedback.** When you press a pad, it should light up, just like when the computer shows it. That confirms the press
landed, and it makes the player's answer look like the sequence they are repeating. Because lighting is already one
function, `light(pad, frames)`, pressing only needs one more line.

**Speed.** Showing every pad for half a second is fine at the start, but boring by round ten. Make the show faster as the
sequence grows, but never faster than a player can follow:

```js
Math.max(12, 30 - sequence.length * 2)   // 28 frames in round 1, 12 from round 9 on
```

A difficulty that grows with the player's progress, with a floor so it never becomes impossible, is the same idea as the
ghost speed in the maze game.

# --explanation-tr--

İki küçük değişiklik oyunu çok daha iyi hissettirir.

**Geri bildirim.** Bir tuşa bastığında, tıpkı bilgisayar gösterirkenki gibi yanmalı. Bu basışın yerine ulaştığını doğrular ve
oyuncunun cevabını tekrarladığı diziye benzetir. Yakma zaten tek bir fonksiyon (`light(pad, frames)`) olduğu için basmak yalnızca
bir satır daha ister.

**Hız.** Her tuşu yarım saniye göstermek başta iyidir ama onuncu turda sıkıcıdır. Dizi uzadıkça gösteriyi hızlandır, ama asla bir
oyuncunun izleyebileceğinden hızlı olmasın:

```js
Math.max(12, 30 - sequence.length * 2)   // 1. turda 28 kare, 9. turdan itibaren 12
```

Oyuncunun ilerlemesiyle büyüyen ve asla imkânsız olmasın diye bir tabanı olan zorluk, labirent oyunundaki hayalet hızıyla aynı
fikirdir.

# --task--

1. Add `PRESS_FRAMES = 12`. `press()` lights the pressed pad for `PRESS_FRAMES` (in the player's turn, right or wrong).
2. Replace `SHOW_FRAMES` with a function `showFrames()` as above, used for how long each pad is shown and the pause after it.

# --task-tr--

1. `PRESS_FRAMES = 12` ekle. `press()` basılan tuşu (oyuncunun sırasında, doğru ya da yanlış) `PRESS_FRAMES` boyunca yakar.
2. `SHOW_FRAMES`'i yukarıdaki gibi bir `showFrames()` fonksiyonuyla değiştir; her tuşun ne kadar gösterildiği ve sonrasındaki
   duraklama için kullanılsın.

# --tests--

A pressed pad should light up briefly.
tr: Basılan bir tuş kısa bir süre yanmalı.

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
