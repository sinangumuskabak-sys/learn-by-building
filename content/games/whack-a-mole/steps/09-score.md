---
title: Show the score
title_tr: Skoru göster
skills: [game.canvas]
---

# --goal--

The score goes in the bar at the top.

# --goal-tr--

Skor, en üstte bıraktığımız 40 piksellik şeride yazılsın.

# --code--

```js
ctx.fillStyle = 'white'
ctx.font = 'bold 20px sans-serif'
ctx.textAlign = 'left'
ctx.fillText('Score: ' + score, 12, 28)
```

# --meaning--

- `font` sets the size and style of the text; `textAlign = 'left'` makes it start at the given point.
- `'Score: ' + score` joins the label and the number.

# --meaning-tr--

- `ctx.font = 'bold 20px sans-serif'` → kalın, 20 piksel, sade bir yazı tipi.
- `ctx.textAlign = 'left'` → yazı verilen noktadan **sağa doğru** başlar.
- `ctx.fillText('Score: ' + score, 12, 28)` → metni soldan 12, yukarıdan 28 piksele yaz. `+` metinle sayıyı yapıştırır.

# --task--

At the end of `draw`, after the holes loop, write the four lines.

# --task-tr--

`draw` fonksiyonunun sonunda, delik döngüsünün altına bir boş satır bırakıp dört satırı yaz. **Çalıştır**.

# --tests--

The score should be written at the top.
tr: Skor en üste yazılmalı.

```js
score = 7
$.tick()
assert.include($.texts(), 'Score: 7')
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0

function isUp(hole) {
  return now < hole.upUntil
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

canvas.addEventListener('pointerdown', (event) => {
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
  }
})

function update() {
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + 1000
    }
    nextPop = now + 700
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
