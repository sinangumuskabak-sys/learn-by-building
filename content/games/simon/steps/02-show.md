---
title: Showing the sequence
title_tr: Diziyi göstermek
skills: [game.loop, game.state]
---

# --explanation--

The computer has to **play a little show**: light the first pad for half a second, pause, light the next, and so on. A
`for` loop cannot do this, because it would run through the whole sequence in one frame. Instead, the show is spread over
many frames with counters:

- `timer` counts down to the next event,
- `showAt` says which step of the sequence comes next,
- `litFor` counts down how long the current pad stays lit.

Each frame, `update()` counts down; when `timer` reaches zero it lights the next pad and sets `timer` again. When every step
has been shown, the state changes from `'showing'` to `'input'`: the player's turn.

Why wait `SHOW_FRAMES + 8` between pads instead of exactly `SHOW_FRAMES`? If the same pad comes twice in a row, it must
go dark in between, or the player would see one long flash instead of two.

# --explanation-tr--

Bilgisayar **küçük bir gösteri** yapmalı: ilk tuşu yarım saniye yak, dur, sonrakini yak ve böyle devam et. Bir `for` döngüsü
bunu yapamaz, çünkü bütün diziyi tek bir karede bitirirdi. Bunun yerine gösteri sayaçlarla birçok kareye yayılır:

- `timer` sonraki olaya kadar geri sayar,
- `showAt` dizinin sıradaki adımını söyler,
- `litFor` şu anki tuşun ne kadar daha yanık kalacağını geri sayar.

Her karede `update()` geri sayar; `timer` sıfıra ulaşınca sonraki tuşu yakar ve `timer`'ı yeniden kurar. Her adım gösterilince
durum `'showing'`'den `'input'`'a geçer: oyuncunun sırası.

Tuşlar arasında neden tam `SHOW_FRAMES` değil de `SHOW_FRAMES + 8` bekleniyor? Aynı tuş art arda iki kez gelirse arada sönmesi
gerekir; yoksa oyuncu iki yerine tek uzun bir yanma görürdü.

# --task--

1. Add `SHOW_FRAMES = 30`, and `sequence`, `state`, `showAt`, `timer` and `litFor`.
2. `reset()` empties the sequence, turns the light off and calls `nextRound()`, which adds a random pad (0 to 3), sets state
   `'showing'`, `showAt = 0` and `timer = 40`.
3. `light(pad, frames)` sets `lit` and `litFor`.
4. `update()`: count `litFor` down and turn the light off when it reaches 0. While showing, count `timer` down; at 0, if the
   whole sequence has been shown, switch to `'input'`; otherwise light the next pad for `SHOW_FRAMES` and set
   `timer = SHOW_FRAMES + 8`.
5. Draw `Round 1` at the top left and `Watch...` or `Your turn` at the top right (white, `'bold 18px sans-serif'`, `y = 27`).

# --task-tr--

1. `SHOW_FRAMES = 30` ile `sequence`, `state`, `showAt`, `timer` ve `litFor` ekle.
2. `reset()` diziyi boşaltır, ışığı söndürür ve rastgele bir tuş (0–3) ekleyen, durumu `'showing'`, `showAt = 0` ve
   `timer = 40` yapan `nextRound()`'u çağırır.
3. `light(pad, frames)` `lit` ve `litFor`'u ayarlar.
4. `update()`: `litFor`'u geri say ve 0'a ulaşınca ışığı söndür. Gösterirken `timer`'ı geri say; 0'da, bütün dizi gösterildiyse
   `'input'`'a geç; değilse sonraki tuşu `SHOW_FRAMES` boyunca yak ve `timer = SHOW_FRAMES + 8` yap.
5. Sol üste `Round 1`, sağ üste `Watch...` ya da `Your turn` çiz (beyaz, `'bold 18px sans-serif'`, `y = 27`).

# --tests--

After a short pause the pad should light up for 30 frames, then it is the player's turn.
tr: Kısa bir duraklamadan sonra tuş 30 kare yanmalı, sonra sıra oyuncuya geçmeli.

```js
assert.lengthOf(sequence, 1)
assert.include([0, 1, 2, 3], sequence[0])
$.tick(39)
assert.strictEqual(lit, -1)
$.tick(1)
assert.strictEqual(lit, sequence[0])
$.tick(29)
assert.strictEqual(lit, sequence[0])
$.tick(1)
assert.strictEqual(lit, -1)
assert.strictEqual(state, 'showing')
$.tick(8)
assert.strictEqual(state, 'input')
assert.include($.texts(), 'Your turn')
```

The same pad twice should flash twice, with a dark moment in between.
tr: Aynı tuş iki kez gelirse arada bir karanlık anla iki kez yanmalı.

```js
sequence = [2, 2]
$.tick(40)
assert.strictEqual(lit, 2)
$.tick(34)
assert.strictEqual(lit, -1)
$.tick(6)
assert.strictEqual(lit, 2)
assert.include($.texts(), 'Round 2')
assert.include($.texts(), 'Watch...')
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
const SHOW_FRAMES = 30 // how long each pad of the sequence stays lit

let sequence // the pads to repeat, growing by one every round
let state // 'showing' or 'input'
let showAt // which step of the sequence is being shown, and when
let timer
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
  light(sequence[showAt], SHOW_FRAMES)
  showAt += 1
  timer = SHOW_FRAMES + 8
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

reset()
requestAnimationFrame(loop)
```
