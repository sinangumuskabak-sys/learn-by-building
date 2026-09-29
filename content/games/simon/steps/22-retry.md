---
title: Click to retry
title_tr: Yeniden denemek için tıkla
skills: [game.input, game.state]
---

# --goal--

When the game is over, a click, or Space, starts a new game with `reset`.

# --goal-tr--

Mesaj `Click to retry` diyor; şimdi sözünü tutalım. Oyun bittiyse bir **tıklama** ya da **Boşluk** tuşu `reset` ile
yeni oyun başlatsın.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }

  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
```

# --meaning--

- After game over, a click resets and `return` stops it from also pressing a pad.
- Space resets too. `&&` means "and". `preventDefault()` stops Space from scrolling the page.

# --meaning-tr--

- Tıklama dinleyicisinin en üstünde: `if (state === 'over') {` → oyun bittiyse `reset()` ile yeni oyun, `return` ile
  çık. `return` olmasaydı aynı tıklama bir tuşa da basmaya çalışırdı.
- Klavye dinleyicisinin sonunda: `if (event.key === ' ' && state === 'over') {` → `&&` "**ve**": "Boşluk basıldı **ve**
  oyun bitti".
  - `event.preventDefault()` → Boşluk tuşunun olağan işini (sayfayı aşağı kaydırmayı) engeller.
  - `reset()` → yeni oyun.

# --task--

1. At the top of the `pointerdown` listener, write the `if (state === 'over')` block.
2. At the end of the `keydown` listener, write the Space block.

# --task-tr--

1. `pointerdown` dinleyicisinin içinde, `const rect = ...` satırının **üstüne** `if (state === 'over') { ... }` bloğunu yaz.
2. `keydown` dinleyicisinin içinde, `if (event.key in KEYS) ...` satırının **altına** Boşluk bloğunu yaz (kapanan `})`
   işaretinden önce).
3. **Çalıştır**, bilerek yanlış bas, sonra tıkla: yeni oyun başlamalı.

# --predict--

The game is over and you click the green pad. What happens?
- [x] A new game starts; the click does not press the pad
  `reset()` runs, then `return` leaves the listener before `press`.
- [ ] The green pad is pressed and you lose again
- [ ] Nothing

# --predict-tr--

Oyun bitti ve yeşil tuşa tıklıyorsun. Ne olur?
- [x] Yeni oyun başlar; tıklama tuşa basmaz
  `reset()` çalışır, sonra `return` dinleyiciden `press`'ten önce çıkar.
- [ ] Yeşil tuşa basılır ve yine kaybedersin
- [ ] Hiçbir şey

# --tests--

A click after a mistake should start a new game.
tr: Hatadan sonra tıklamak yeni oyun başlatmalı.

```js
sequence = [0, 3]
$.tick(200)
$.click(300, 300)
assert.strictEqual(state, 'over')
$.click(200, 200)
assert.deepEqual([state, sequence.length], ['showing', 1])
```

Space after a mistake should start a new game too.
tr: Hatadan sonra Boşluk da yeni oyun başlatmalı.

```js
sequence = [0, 3]
$.tick(200)
$.press('s')
assert.strictEqual(state, 'over')
$.press(' ')
assert.deepEqual([state, sequence.length], ['showing', 1])
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
