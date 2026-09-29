---
title: Floating +1
title_tr: Yükselen +1
skills: [game.canvas]
---

# --goal--

Each popup is drawn as a yellow "+1" that rises 30 pixels and fades out over its 600 ms.

# --goal-tr--

Her popup sarı bir "+1" olarak çizilsin: 600 ms boyunca **30 piksel yükselsin** ve giderek **silikleşsin**.

# --code--

```js
ctx.fillStyle = '#fef08a'
ctx.font = 'bold 24px sans-serif'
ctx.textAlign = 'center'
for (const p of popups) {
  const t = (now - p.born) / 600 // 0 → 1 over the popup's life
  ctx.globalAlpha = 1 - t
  ctx.fillText('+1', p.x, p.y - t * 30)
}
ctx.globalAlpha = 1
```

# --meaning--

- `t` goes from 0 when the popup is born to 1 when it dies.
- `globalAlpha` is how see-through everything drawn next is: 1 − t fades it out.
- `p.y - t * 30` moves it up by up to 30 pixels.
- `globalAlpha = 1` afterwards, so the rest of the picture is drawn solid again.

# --meaning-tr--

- `const t = (now - p.born) / 600` → popup'ın ömrünün ne kadarı geçti: doğunca 0, ölürken 1.
- `ctx.globalAlpha = 1 - t` → bundan sonra çizilen her şeyin **görünürlüğü**: 1 tam, 0 hiç. `1 - t` ile giderek
  silikleşir.
- `p.y - t * 30` → yaşlandıkça 30 piksele kadar **yukarı** çıkar.
- `ctx.globalAlpha = 1` → döngüden sonra geri al; yoksa skor yazısı da silik çizilirdi.

# --task--

In `draw`, between the holes loop and the white score text, write the popup lines.

# --task-tr--

`draw` içinde delik döngüsü ile beyaz skor yazısının arasına (bir boş satırla) popup satırlarını yaz. **Çalıştır** ve vur!

# --tests--

A popup should be drawn as a +1 that rises and fades.
tr: Popup yükselip silikleşen bir +1 olarak çizilmeli.

```js
popups = [{ x: 180, y: 180, born: now }]
$.run(0.3)
const call = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '+1')
assert.isOk(call, 'a "+1" is drawn')
assert.isBelow(call.args[2], 180)
assert.isBelow(call.alpha, 1)
```

After the popups, drawing should be solid again.
tr: Popup'lardan sonra çizim yeniden tam görünür olmalı.

```js
popups = [{ x: 180, y: 180, born: now }]
$.run(0.3)
const score = $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Score'))
assert.strictEqual(score.alpha, 1)
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
const ROUND = 30000 // a round lasts 30 seconds

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0
let state = 'ready' // 'ready', 'playing' or 'over'
let endsAt = 0
let best = Number(localStorage.getItem('mole-best')) || 0
let popups = [] // floating "+1"s: { x, y, born }

function isUp(hole) {
  return now < hole.upUntil
}

// 0 when the round starts, 1 when it ends.
function progress() {
  return Math.min(1, Math.max(0, 1 - (endsAt - now) / ROUND))
}

// Linear interpolation from the easy value to the hard value as the round goes on.
function upTime() {
  return 1000 - 500 * progress()
}

function popGap() {
  return 700 - 350 * progress()
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

function start() {
  state = 'playing'
  score = 0
  endsAt = now + ROUND
  nextPop = now
  popups = []
  for (const hole of holes) hole.upUntil = 0
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') {
    start()
    return
  }
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
    popups.push({ x: hole.x, y: hole.y - 40, born: now })
  }
})

function update() {
  popups = popups.filter((p) => now - p.born < 600)
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    if (score > best) {
      best = score
      localStorage.setItem('mole-best', best)
    }
    return
  }
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + upTime()
    }
    nextPop = now + popGap()
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

  ctx.fillStyle = '#fef08a'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  for (const p of popups) {
    const t = (now - p.born) / 600 // 0 → 1 over the popup's life
    ctx.globalAlpha = 1 - t
    ctx.fillText('+1', p.x, p.y - t * 30)
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
  if (state === 'playing') {
    ctx.textAlign = 'right'
    ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, canvas.height / 2 + 28)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 150)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, 252)
    ctx.fillText('Click to play again', canvas.width / 2, 282)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
