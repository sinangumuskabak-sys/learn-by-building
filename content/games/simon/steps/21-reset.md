---
title: A function for a new game
title_tr: Yeni oyun fonksiyonu
skills: [game.state, prog.functions]
---

# --goal--

A new game means an empty sequence, no light, and a first round. We collect that in one function, `reset`, and the
first game starts through it too.

# --goal-tr--

Yanlış basınca oyun bitiyor ama yeniden başlayamıyor. Yeni bir oyun için her şey **başlangıç hâline** dönmeli: dizi boş,
hiçbir tuş yanmıyor, sonra ilk tur.

Bunu tek bir fonksiyonda topluyoruz: `reset` (sıfırla). İlk oyun da aynı yoldan başlayacak; böylece başlangıç hâli
dosyada **tek bir yerde** yazılı olur. Ekran aynı kalacak.

# --code--

```js
let sequence // the pads to repeat, growing by one every round

let lit // the pad lit right now, or -1
let litFor

function reset() {
  sequence = []
  lit = -1
  litFor = 0
  nextRound()
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `sequence`, `lit` and `litFor` are now only declared; `reset` gives them their values.
- `reset` ends with `nextRound()`, which adds the first pad and starts the show.
- `reset()` at the bottom replaces the old `nextRound()` call.

# --meaning-tr--

- `let sequence`, `let lit`, `let litFor` → değerleri siliyoruz; yalnız **tanıtıyoruz**. Değerlerini `reset` verecek.
  (Yorumlar yerinde kalır.)
- `function reset() { ... }` → boş dizi, sönük tuşlar, sıfır süre, sonra `nextRound()`: ilk tuşu ekle ve gösteriyi
  başlat.
- En alttaki `nextRound()` çağrısı `reset()` oluyor: oyun artık hep aynı kapıdan başlar.

# --task--

1. Remove the values from `let sequence`, `let lit` and `let litFor` (keep the comments).
2. Under `let litFor`, leave an empty line and write `reset`.
3. At the very bottom, replace `nextRound()` with `reset()`.

# --task-tr--

1. `let sequence = [] // ...` satırındaki ` = []` kısmını sil; yorum kalsın.
2. `let lit = -1 // ...` satırındaki ` = -1` kısmını ve `let litFor = 0` satırındaki ` = 0` kısmını sil.
3. `let litFor` satırının altına bir boş satır bırak ve `reset` fonksiyonunu yaz (`function nextRound`'un üstünde).
4. Dosyanın **en altındaki** `nextRound()` satırını `reset()` yap.
5. **Çalıştır**: oyun eskisi gibi başlamalı.

# --hint--

If the game shows an error, check that `reset()` at the bottom comes before `requestAnimationFrame(loop)`.

# --hint-tr--

Oyun hata veriyorsa en alttaki `reset()` satırının `requestAnimationFrame(loop)` satırından **önce** olduğundan emin ol.

# --tests--

`reset()` should start a fresh game.
tr: `reset()` yeni bir oyun başlatmalı.

```js
sequence = [1, 2, 3]
lit = 2
litFor = 5
state = 'over'
reset()
assert.lengthOf(sequence, 1)
assert.deepEqual([lit, litFor, state, showAt, inputAt], [-1, 0, 'showing', 0, 0])
```

The first game should start as before.
tr: İlk oyun eskisi gibi başlamalı.

```js
assert.lengthOf(sequence, 1)
assert.strictEqual(state, 'showing')
$.tick(40)
assert.strictEqual(lit, sequence[0])
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
