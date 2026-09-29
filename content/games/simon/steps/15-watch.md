---
title: Watch, then your turn
title_tr: İzle, sonra sıra sende
skills: [game.canvas, game.state]
---

# --goal--

The top right says what is happening: `Watch...` while the computer shows the sequence, `Your turn` when the player
should repeat it.

# --goal-tr--

Oyuncu ne zaman izleyeceğini, ne zaman basacağını bilmeli. Sağ üste bir mesaj yazacağız: bilgisayar gösterirken
`Watch...` (izle), sıra oyuncuya gelince `Your turn` (sıra sende).

# --code--

```js
ctx.textAlign = 'right'
ctx.fillText(state === 'showing' ? 'Watch...' : 'Your turn', canvas.width - 10, 27)
```

# --meaning--

- `textAlign = 'right'` makes x the right edge of the text, so it ends 10 pixels from the right side.
- The short question picks the message from the state.

# --meaning-tr--

- `ctx.textAlign = 'right'` → verilen x yazının **sağ** kenarı olsun. Böylece yazı ne kadar uzun olursa olsun sağ
  kenardan 10 piksel içeride biter.
- `state === 'showing' ? 'Watch...' : 'Your turn'` → kısa soru: gösteri sürüyorsa `'Watch...'`, değilse `'Your turn'`.
- `canvas.width - 10, 27` → sağ kenardan 10 piksel içeride, `Round` yazısıyla aynı yükseklikte.
- Renk ve yazı tipi üstteki satırlardan gelir; yeniden yazmaya gerek yok.

# --task--

In `draw`, under the `Round` line, write the two new lines.

# --task-tr--

`draw` içinde `ctx.fillText('Round ' ...)` satırının **altına** iki yeni satırı yaz. **Çalıştır**: önce `Watch...`, tuş sönünce `Your turn` yazmalı.

# --tests--

`Watch...` should show during the show, `Your turn` after it.
tr: Gösteri sırasında `Watch...`, sonra `Your turn` görünmeli.

```js
$.tick(1)
assert.include($.texts(), 'Watch...')
$.tick(80)
assert.strictEqual(state, 'input')
assert.include($.texts(), 'Your turn')
```

The message should end 10 pixels from the right edge.
tr: Mesaj sağ kenardan 10 piksel içeride bitmeli.

```js
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Watch...')
assert.deepEqual(text.args.slice(1, 3), [390, 27])
assert.strictEqual(ctx.textAlign, 'right')
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

let sequence = [] // the pads to repeat, growing by one every round
let state // 'showing' or 'input'
let showAt // which step of the sequence is being shown, and when
let timer
let lit = -1 // the pad lit right now, or -1
let litFor = 0

function nextRound() {
  sequence.push(Math.floor(Math.random() * 4))
  state = 'showing'
  showAt = 0
  timer = 40 // a short pause before the sequence is shown
}

function light(pad, frames) {
  lit = pad
  litFor = frames
}

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
