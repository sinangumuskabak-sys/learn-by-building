---
title: Save the best score
title_tr: Rekoru kaydet
skills: [game.state]
---

# --goal--

The score is the longest sequence you repeated: failing in round 5 means you did round 4, so it is
`sequence.length - 1`. The best score is kept in `localStorage`, which survives page reloads.

# --goal-tr--

Simon'da skor, **tekrarlayabildiğin en uzun dizinin** uzunluğu. 5. turda hata yaptıysan 4. turu doğru tekrarlamışsındır:
skor `sequence.length - 1`. Bu tür "bir fazla, bir eksik" ayrıntıları üzerine düşünmeye değer: kaybettiğin tur sayılmaz.

En iyi skoru (rekoru) **`localStorage`**'da tutacağız: tarayıcının küçük bir **defteri**. İçine yazdığın şey sayfayı
yenilesen de kalır.

# --code--

```js
let best = Number(localStorage.getItem('simon-best')) || 0

    state = 'over'
    const score = sequence.length - 1
    if (score > best) {
      best = score
      localStorage.setItem('simon-best', best)
    }
    return
```

# --meaning--

- `localStorage.getItem('simon-best')` reads the saved text, or `null`; `Number(...)` makes it a number and `|| 0` uses 0
  when there is nothing.
- On a mistake, the score is `sequence.length - 1`; a higher score becomes the best and is saved with `setItem`.

# --meaning-tr--

- `localStorage.getItem('simon-best')` → defterde `'simon-best'` adıyla ne yazıyor? Defter her şeyi **yazı** olarak
  saklar (`'4'`); hiç kayıt yoksa `null` ("hiçbir şey") verir.
- `Number(...)` → yazıyı sayıya çevirir: `'4'` → `4`. `|| 0` → "soldaki boşsa ya da sıfırsa 0 kullan".
- `best` `reset`'in içinde değil: yeni oyunda dizi sıfırlanır ama rekor kalır.
- `const score = sequence.length - 1` → kaybettiğin tur sayılmaz.
- `if (score > best) {` → rekoru geçtiysen: `best = score` ve `localStorage.setItem('simon-best', best)` ile deftere yaz.

# --task--

1. Under `let litFor`, write the `best` line.
2. In `press`, inside the wrong-pad block, between `state = 'over'` and `return`, write the score lines.

# --task-tr--

1. `let litFor` satırının altına `best` satırını yaz.
2. `press` içinde, yanlış tuş bloğunda `state = 'over'` ile `return` satırlarının **arasına** skor satırlarını yaz.
3. **Çalıştır**. Rekor henüz ekranda görünmüyor; kontroller defteri deneyecek.

# --predict--

You fail in round 1, on the very first pad. What is your score?
- [ ] 1
- [x] 0
  `sequence.length - 1` is 0: you did not repeat any sequence.
- [ ] -1

# --predict-tr--

1. turda, daha ilk tuşta hata yapıyorsun. Skorun kaç?
- [ ] 1
- [x] 0
  `sequence.length - 1` = 0: hiçbir diziyi tekrarlayamadın.
- [ ] -1

# --hint--

`'simon-best'` must be spelled exactly the same in `getItem` and `setItem`.

# --hint-tr--

`'simon-best'` yazısı `getItem` ve `setItem` içinde birebir aynı olmalı.

# --tests--

Failing in round 5 should record 4.
tr: 5. turda kaybetmek 4 kaydetmeli.

```js
assert.strictEqual(best, 0)
sequence = [0, 1, 2, 3, 0]
$.tick(400)
assert.strictEqual(state, 'input')
press(3)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 4)
assert.strictEqual(localStorage.getItem('simon-best'), '4')
```

A shorter game should not lower the best.
tr: Daha kısa bir oyun rekoru düşürmemeli.

```js
best = 7
$.tick(100)
press((sequence[0] + 1) % 4)
assert.strictEqual(state, 'over')
assert.strictEqual(best, 7)
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
