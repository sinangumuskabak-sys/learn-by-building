---
title: Play with the mouse
title_tr: Fareyle oyna
skills: [game.input]
---

# --goal--

A `pointerdown` on the canvas (mouse or finger) is turned into canvas pixels, then into a pad with `padAt`, and pressed.
The canvas may be shown at a different place and size on the page, so we subtract where it starts and scale.

# --goal-tr--

Şimdi tuşlara **tıklayarak** (telefonda dokunarak) oynayacağız. Tarayıcı tıklamanın yerini **sayfaya göre** verir;
canvas ise sayfanın köşesinde başlamıyor ve ekranda farklı boyda gösterilebiliyor (telefonda küçülür).

Bu yüzden tıklamayı önce canvas'ın kendi piksellerine çeviririz, sonra `padAt` ile tuşu buluruz.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const pad = padAt(x, y)
  if (pad >= 0) press(pad)
})
```

# --meaning--

- `pointerdown` fires when the canvas is pressed with a mouse or a finger.
- `getBoundingClientRect()` gives where the canvas is on the page and how big it is shown.
- Subtract its left/top, then scale by `canvas.width / rect.width`: now `x`, `y` are canvas pixels.
- `pad >= 0` skips clicks on the text strip.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', ...)` → canvas'a fareyle **basıldığında** ya da parmakla dokunulduğunda.
- `canvas.getBoundingClientRect()` → canvas'ın sayfadaki **dikdörtgeni**: nerede başladığı (`left`, `top`) ve ekranda ne
  kadar büyük gösterildiği (`width`, `height`).
- `event.clientX - rect.left` → tıklamanın sayfadaki x'inden canvas'ın başladığı yeri çıkar: canvas içindeki konum.
- `* canvas.width / rect.width` → **ölçekle**: canvas 800 piksel gösteriliyorsa 400 / 800 = 0.5 ile çarp. Bu adımı
  atlamak yaygın bir hatadır: kendi ekranında çalışır, telefonda yanlış tuşa düşer.
- `const pad = padAt(x, y)` → önceki adımın fonksiyonu.
- `if (pad >= 0) press(pad)` → `>=` "büyük veya eşit": gerçek bir tuşa tıklandıysa bas.

# --task--

Under `padAt`, leave an empty line and write the `pointerdown` listener, right above the `keydown` listener.

# --task-tr--

`padAt` fonksiyonunun altına bir boş satır bırak ve `pointerdown` dinleyicisini yaz; `keydown` dinleyicisi hemen altında (arada boş satır olmadan) kalsın. **Çalıştır**, gösteriyi izle ve aynı tuşa tıkla: dizi bir uzamalı.

# --tests--

Clicking a pad in the player's turn should press it; clicks during the show are ignored.
tr: Oyuncunun sırasında tuşa tıklamak ona basmalı; gösteri sırasındaki tıklamalar yok sayılmalı.

```js
sequence = [1]
$.click(300, 100)
assert.strictEqual(state, 'showing')
$.tick(78)
$.click(300, 100)
assert.lengthOf(sequence, 2)
```

Clicks should be scaled when the canvas is shown at a different size.
tr: Canvas farklı boyda gösterildiğinde tıklamalar ölçeklenmeli.

```js
// Pretend the canvas is shown twice as big, starting 10px from the left of the page.
$.canvas.getBoundingClientRect = () => ({ left: 10, top: 0, x: 10, y: 0, width: 800, height: 880, right: 810, bottom: 880 })
sequence = [3]
$.tick(78)
$.click(10 + 700, 700)
assert.lengthOf(sequence, 2, 'a click at (700, 700) on the big canvas is the bottom-right pad')
```

A click on the text strip should do nothing.
tr: Yazı şeridine tıklamak hiçbir şey yapmamalı.

```js
$.tick(78)
$.click(100, 10)
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
