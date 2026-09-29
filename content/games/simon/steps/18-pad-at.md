---
title: Which pad is at a point?
title_tr: Bir noktada hangi tuş var?
skills: [prog.functions]
---

# --goal--

To play with the mouse we must know which pad is under a point. `padAt(x, y)` answers `-1` in the text strip, and
otherwise 0 to 3 from the half of the board the point is in.

# --goal-tr--

Fareyle oynamak için önce şu soruyu cevaplamalıyız: **bir noktanın altında hangi tuş var?** Tuşlar tahtanın dört
çeyreğinde; noktanın üst mü alt yarıda, sol mu sağ yarıda olduğuna bakmak yeter.

Bu adımda yalnız cevap veren fonksiyonu yazıyoruz: `padAt` (şuradaki tuş).

# --code--

```js
function padAt(x, y) {
  if (y < TOP) return -1
  return (y - TOP < HALF ? 0 : 2) + (x < HALF ? 0 : 1)
}
```

# --meaning--

- In the text strip (`y < TOP`) there is no pad: `-1`.
- Top half gives 0, bottom half 2; left half adds 0, right half 1. Bottom right: 2 + 1 = 3.

# --meaning-tr--

- `function padAt(x, y)` → bir noktanın x'ini ve y'sini alır, tuş numarasını **geri verir** (`return`).
- `if (y < TOP) return -1` → `<` küçüktür: nokta üstteki yazı şeridindeyse tuş yok, `-1`.
- `y - TOP < HALF ? 0 : 2` → şeridin altından ölçünce üst yarıdaysa 0, alt yarıdaysa 2.
- `x < HALF ? 0 : 1` → sol yarıdaysa 0, sağ yarıdaysa 1.
- İkisi toplanır: sağ alt → 2 + 1 = **3**, sol üst → 0 + 0 = **0**. 5. adımdaki numaralarla aynı.

# --task--

Under `press`, leave an empty line and write `padAt` (above the `keydown` listener).

# --task-tr--

`press` fonksiyonunun altına bir boş satır bırak ve `padAt`'i yaz; `keydown` dinleyicisi onun altında kalsın. **Çalıştır**.

# --predict--

What is `padAt(300, 100)`?
- [ ] 0
- [x] 1
  Top half gives 0, right half adds 1: the red pad, top right.
- [ ] 3

# --predict-tr--

`padAt(300, 100)` kaç?
- [ ] 0
- [x] 1
  Üst yarı 0 verir, sağ yarı 1 ekler: sağ üstteki kırmızı tuş.
- [ ] 3

# --tests--

A point should find its pad.
tr: Bir nokta kendi tuşunu bulmalı.

```js
assert.deepEqual([padAt(100, 100), padAt(300, 100), padAt(100, 300), padAt(300, 300)], [0, 1, 2, 3])
```

The text strip and the borders should be handled.
tr: Yazı şeridi ve sınırlar doğru ele alınmalı.

```js
assert.strictEqual(padAt(100, 20), -1)
assert.strictEqual(padAt(199, 239), 0)
assert.strictEqual(padAt(200, 240), 3)
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
  ctx.fillText(state === 'showing' ? 'Watch...' : 'Your turn', canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

nextRound()
requestAnimationFrame(loop)
```
