---
title: Your turn
title_tr: Senin sıran
skills: [game.input, game.state]
---

# --explanation--

Now the player repeats the sequence. `inputAt` counts how far they have got. Every press is checked against **one** step:

```js
if (pad !== sequence[inputAt]) -> wrong: game over
else inputAt += 1, and if that was the last step: next round
```

Checking press by press, instead of waiting for the whole answer, means a mistake ends the round at once, the way players
expect.

Presses only count during the player's turn: while the computer is showing the sequence, clicks are ignored. This is the
state machine at work again: the same click means "answer" in one state and nothing in another.

A click is turned into a pad by checking which half of the board it is in, left or right, top or bottom. The keyboard works
too: Q W on the top row and A S below mirror the layout, and 1 to 4 also work.

# --explanation-tr--

Şimdi oyuncu diziyi tekrarlar. `inputAt` nereye kadar geldiğini sayar. Her basış **tek** bir adıma karşı kontrol edilir:

```js
if (pad !== sequence[inputAt]) -> yanlış: oyun bitti
else inputAt += 1 ve o son adımsa: sonraki tur
```

Bütün cevabı beklemek yerine basış basış kontrol etmek, bir hatanın turu oyuncuların beklediği gibi hemen bitirmesi demektir.

Basışlar yalnızca oyuncunun sırasında sayılır: bilgisayar diziyi gösterirken tıklamalar yok sayılır. Bu yine iş başındaki durum
makinesidir: aynı tıklama bir durumda "cevap", başka bir durumda hiçbir şey demektir.

Bir tıklama, tahtanın hangi yarısında olduğuna (sol ya da sağ, üst ya da alt) bakılarak bir tuşa çevrilir. Klavye de çalışır:
üst sırada Q W ve altta A S düzeni yansıtır; 1'den 4'e de çalışır.

# --task--

1. Add `KEYS = { q: 0, w: 1, a: 2, s: 3, 1: 0, 2: 1, 3: 2, 4: 3 }` and `inputAt` (`0` in `nextRound()`).
2. Write `press(pad)`: only while the state is `'input'`. A wrong pad sets the state to `'over'`; a right one adds 1 to
   `inputAt`, and after the last step calls `nextRound()`.
3. Write `padAt(x, y)`: `-1` above `TOP`, otherwise 0 to 3 from the quarter. On `pointerdown` (in canvas pixels) press that
   pad, or `reset()` when the game is over. On `keydown` (ignoring repeats), press the pad for the key; Space resets when over.
4. The message becomes `Your turn: 2/5` in the player's turn and `Wrong! Click to retry` when over.

# --task-tr--

1. `KEYS = { q: 0, w: 1, a: 2, s: 3, 1: 0, 2: 1, 3: 2, 4: 3 }` ve `inputAt` (`nextRound()`'da `0`) ekle.
2. `press(pad)` yaz: yalnızca durum `'input'` iken. Yanlış bir tuş durumu `'over'` yapar; doğru bir tuş `inputAt`'e 1 ekler ve
   son adımdan sonra `nextRound()` çağırır.
3. `padAt(x, y)` yaz: `TOP`'un üstünde `-1`, değilse çeyreğe göre 0'dan 3'e. `pointerdown`'da (canvas piksellerinde) o tuşa
   bas ya da oyun bittiyse `reset()`. `keydown`'da (tekrarları yok sayarak) tuşa karşılık gelen tuşa bas; bittiyse Boşluk
   sıfırlar.
4. Mesaj oyuncunun sırasında `Your turn: 2/5`, bitince `Wrong! Click to retry` olur.

# --tests--

A click should find its pad.
tr: Bir tıklama tuşunu bulmalı.

```js
assert.deepEqual([padAt(100, 100), padAt(300, 100), padAt(100, 300), padAt(300, 300)], [0, 1, 2, 3])
assert.strictEqual(padAt(100, 20), -1)
```

Repeating the sequence correctly should start a longer one.
tr: Diziyi doğru tekrarlamak daha uzun birini başlatmalı.

```js
$.tick(78)
assert.strictEqual(state, 'input')
const first = sequence[0]
press(first)
assert.lengthOf(sequence, 2)
assert.strictEqual(sequence[0], first, 'the old sequence stays, one pad is added')
assert.deepEqual([state, inputAt], ['showing', 0])
```

Presses during the show should be ignored, and keys should work.
tr: Gösteri sırasındaki basışlar yok sayılmalı ve tuşlar çalışmalı.

```js
sequence = [1]
$.click(300, 100)
assert.strictEqual(state, 'showing')
assert.lengthOf(sequence, 1)
$.tick(78)
$.press('w')
assert.lengthOf(sequence, 2)
```

A wrong pad should end the game, and a click should start again.
tr: Yanlış bir tuş oyunu bitirmeli ve bir tıklama yeniden başlatmalı.

```js
sequence = [0, 3]
$.tick(200)
assert.strictEqual(state, 'input')
$.click(100, 100) // 0: right
$.tick(1)
assert.include($.texts(), 'Your turn: 1/2')
$.click(100, 100) // 0 again: wrong
assert.strictEqual(state, 'over')
$.tick(1)
assert.include($.texts(), 'Wrong! Click to retry')
$.click(200, 200)
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
const SHOW_FRAMES = 30 // how long each pad of the sequence stays lit

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
