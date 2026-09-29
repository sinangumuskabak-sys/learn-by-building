---
title: Swipe to hop
title_tr: Kaydırarak zıpla
skills: [game.input]
---

# --goal--

On a phone, a swipe hops in its direction and a short tap hops forward. We remember where the finger went down and
compare it with where it came up.

# --goal-tr--

Telefonda: parmakla **kaydırmak** o yöne zıplatsın, kısa bir **dokunuş** ileri zıplatsın. Parmağın nerede **bastığını**
hatırlayıp nerede **kalktığıyla** karşılaştırıyoruz.

# --code--

```js
// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})
```

# --meaning--

- `dx`, `dy` are how far the finger moved. Less than 20 pixels either way is a tap.
- Otherwise the bigger of the two decides: sideways or up/down. `Math.sign` gives -1 or 1.

# --meaning-tr--

- `swipeStart` → parmağın bastığı nokta; `null` → henüz basılmadı.
- `dx`, `dy` → parmağın ne kadar kaydığı (yatay, dikey).
- `Math.abs` → mutlak değer (işaretsiz). İkisi de 20 pikselden küçükse bu bir **dokunuş**: ileri zıpla.
- `Math.abs(dx) > Math.abs(dy)` → daha çok **yatay** kaydırılmış: sağa ya da sola. `Math.sign(dx)` → eksi ise -1,
  artı ise 1.
- Değilse dikey: yukarı ya da aşağı.

# --task--

Under the `keydown` listener, write the comment and the touch listeners.

# --task-tr--

`keydown` dinleyicisinin altına bir boş satır bırakıp yorumu ve dokunma satırlarını yaz. **Çalıştır**.

# --tests--

A short tap should hop forward.
tr: Kısa bir dokunuş ileri zıplatmalı.

```js
$.click(200, 300)
assert.deepEqual(frog, { x: 5, y: 11 })
```

A swipe should hop in its direction.
tr: Kaydırma kendi yönüne zıplatmalı.

```js
$.pointerDown(200, 300)
$.pointerUp(260, 310)
assert.deepEqual(frog, { x: 6, y: 12 })
$.pointerDown(200, 300)
$.pointerUp(205, 240)
assert.deepEqual(frog, { x: 6, y: 11 })
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

let frog = { x: 5, y: START_ROW }

function hop(dx, dy) {
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
})

// Touch: a swipe hops that way, a short tap hops forward.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    hop(0, -1)
  } else if (Math.abs(dx) > Math.abs(dy)) {
    hop(Math.sign(dx), 0)
  } else {
    hop(0, Math.sign(dy))
  }
})

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
