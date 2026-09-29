---
title: The best time
title_tr: En iyi süre
skills: [game.state]
---

# --goal--

Your fastest win is kept in `localStorage`, which the browser keeps even after the page is closed, so there is always a time
to beat. It is shown at the top right.

# --goal-tr--

En hızlı kazandığın süreyi **saklayacağız**; böylece her zaman geçilecek bir rekor olur. Sayfa kapanınca değişkenler
silinir, ama tarayıcının küçük bir defteri var: **`localStorage`**. Oraya yazılan bilgi sayfa kapansa da kalır.

Rekor sağ üstte görünecek: `Best 95s`, henüz yoksa `Best -`.

# --code--

```js
let best = Number(localStorage.getItem('solitaire-best')) || 0

    const seconds = Math.floor(frames / 60)
    if (best === 0 || seconds < best) {
      best = seconds
      localStorage.setItem('solitaire-best', best)
    }

  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best ? best + 's' : '-'), canvas.width - LEFT, 24)
```

# --meaning--

- `localStorage.getItem(name)` reads a saved text (or `null`); `Number(...)` makes it a number; `|| 0` uses 0 when there is
  none.
- On a win, the time is saved if there is no best yet or it is faster.
- `best ? best + 's' : '-'` shows `95s`, or `-` while `best` is 0.

# --meaning-tr--

- `localStorage.getItem('solitaire-best')` → defterden `'solitaire-best'` adlı kaydı okur. Kayıt **yazı** olarak
  saklanır (`'95'`); hiç yoksa `null` gelir.
- `Number(...)` → yazıyı sayıya çevirir: `'95'` → 95. `Number(null)` → 0.
- `|| 0` → soldaki değer "yanlış" sayılırsa (0, `NaN`...) 0 kullan. Rekor yoksa `best` 0.
- `checkWin` içinde:
  - `const seconds = Math.floor(frames / 60)` → bu oyunun süresi.
  - `if (best === 0 || seconds < best)` → henüz rekor yoksa **veya** bu süre daha kısaysa...
  - `best = seconds` ve `localStorage.setItem('solitaire-best', best)` → ...yeni rekoru hem değişkene hem deftere yaz.
- `ctx.textAlign = 'right'` → verilen x yazının **sağ ucu**; `canvas.width - LEFT` sağ kenardan 16 piksel içeride.
- `best ? best + 's' : '-'` → rekor varsa `95s`, yoksa `-`.

# --task--

1. Under `let won` write `let best = ...`.
2. In `checkWin`, under `won = true`, write the five lines.
3. In `draw`, under the `Moves` text line (above `if (won)`), write the two lines.

# --task-tr--

1. `let won` satırının altına `let best = ...` satırını yaz.
2. `checkWin` içinde `won = true` satırının altına beş satırı yaz.
3. `draw` içinde `ctx.fillText('Moves ' + ...)` satırının altına, `if (won) {` satırının üstüne iki satırı yaz.
4. **Çalıştır**: sağ üstte `Best -` görmelisin.

# --hint--

`localStorage` keeps text: `getItem` gives `'95'`, and `Number('95')` turns it back into 95.

# --hint-tr--

`localStorage` yazı saklar: `getItem` `'95'` verir, `Number('95')` onu yeniden 95 sayısına çevirir.

# --tests--

The last card onto a foundation should save the best time.
tr: Bir temele giden son kart en iyi süreyi kaydetmeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
for (let f = 0; f < 4; f++) piles['f' + f] = Array.from({ length: 12 }, (_, i) => c(i + 1, f))
for (let f = 0; f < 3; f++) piles['f' + f].push(c(13, f))
piles.t0 = [c(13, 3)]
frames = 60 * 95
$.click(16 + 20, 136 + 30)
assert.isTrue(won)
assert.strictEqual(best, 95)
assert.strictEqual(localStorage.getItem('solitaire-best'), '95')
$.tick(1)
assert.include($.texts(), 'You won in 1 moves!')
assert.include($.texts(), 'Best 95s')
```

A slower win should not replace the best time.
tr: Daha yavaş bir galibiyet en iyi süreyi değiştirmemeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
for (let f = 0; f < 4; f++) piles['f' + f] = Array.from({ length: 12 }, (_, i) => c(i + 1, f))
for (let f = 0; f < 3; f++) piles['f' + f].push(c(13, f))
piles.t0 = [c(13, 3)]
best = 80
frames = 60 * 95
tryMove('t0', 0, 'f3')
assert.isTrue(won)
assert.strictEqual(best, 80)
```

With no best time yet, `Best -` should be shown at the top right.
tr: Henüz rekor yokken sağ üstte `Best -` görünmeli.

```js
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Best -')
assert.exists(text, "'Best -'")
assert.deepEqual(text.args.slice(1), [464, 24])
```

# --solution--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const CW = 56 // card width
const CH = 78
const LEFT = 16
const COL = 64 // distance between columns
const TOP_Y = 40 // the stock, the waste and the foundations
const TAB_Y = 136 // the seven tableau columns
const DOWN_STEP = 8 // how much of a face-down card shows under the next one
const UP_STEP = 22

let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }
let drag // { from, index, dx, dy, x, y, moved } while a card is held
let moves
let frames
let won
let best = Number(localStorage.getItem('solitaire-best')) || 0

const isRed = (card) => card.suit === 1 || card.suit === 2
const last = (pile) => pile[pile.length - 1]
const colX = (i) => LEFT + i * COL

function newDeck() {
  const deck = []
  for (let suit = 0; suit < 4; suit++) for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit, up: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// Column i gets i + 1 cards, the last one face up; the rest is the stock.
function deal() {
  const deck = newDeck()
  piles = { stock: [], waste: [] }
  for (let f = 0; f < 4; f++) piles['f' + f] = []
  for (let i = 0; i < 7; i++) {
    piles['t' + i] = deck.splice(0, i + 1)
    last(piles['t' + i]).up = true
  }
  piles.stock = deck
  drag = null
  moves = 0
  frames = 0
  won = false
}

// Where each pile sits on the table.
function pileX(key) {
  if (key === 'stock') return colX(0)
  if (key === 'waste') return colX(1)
  if (key[0] === 'f') return colX(3 + Number(key[1]))
  return colX(Number(key[1]))
}

// The y of card `index` in a tableau column: face-down cards overlap more than face-up ones.
function cardY(key, index) {
  if (key[0] !== 't') return TOP_Y
  let y = TAB_Y
  const pile = piles[key]
  for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP
  return y
}

// Tableau: one lower, the other color; only a king goes into an empty column.
function canStack(card, pile) {
  const under = last(pile)
  if (!under) return card.rank === 13
  return under.up && under.rank === card.rank + 1 && isRed(under) !== isRed(card)
}

// Foundation: same suit, one higher, starting from the ace.
function canFound(card, pile) {
  const under = last(pile)
  if (!under) return card.rank === 1
  return under.suit === card.suit && under.rank === card.rank - 1
}

function flipStock() {
  if (piles.stock.length) {
    const card = piles.stock.pop()
    card.up = true
    piles.waste.push(card)
  } else {
    // An empty stock takes the waste back, face down, in the same order as before.
    piles.stock = piles.waste.reverse().map((card) => ({ ...card, up: false }))
    piles.waste = []
  }
  moves += 1
}

// Move cards from index onwards of pile `from` to pile `to`, if the rules allow it.
function tryMove(from, index, to) {
  const cards = piles[from].slice(index)
  if (from === to || !cards.length) return false
  const allowed = to[0] === 'f' ? cards.length === 1 && canFound(cards[0], piles[to]) : to[0] === 't' && canStack(cards[0], piles[to])
  if (!allowed) return false
  piles[to].push(...piles[from].splice(index))
  const exposed = last(piles[from])
  if (from[0] === 't' && exposed) exposed.up = true
  moves += 1
  checkWin()
  return true
}

// A tap sends a card to the best place it can go: a foundation first, then a tableau column.
function autoMove(from, index) {
  const targets = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6']
  return targets.some((to) => tryMove(from, index, to))
}

function checkWin() {
  if (['f0', 'f1', 'f2', 'f3'].every((f) => piles[f].length === 13)) {
    won = true
    const seconds = Math.floor(frames / 60)
    if (best === 0 || seconds < best) {
      best = seconds
      localStorage.setItem('solitaire-best', best)
    }
  }
}

// Which card, or which empty pile, is at (x, y)? The card drawn last, on top, wins.
function hit(x, y) {
  for (const key of Object.keys(piles)) {
    const px = pileX(key)
    if (x < px || x > px + CW) continue
    const pile = piles[key]
    if (key[0] === 't') {
      for (let i = pile.length - 1; i >= 0; i--) {
        const cy = cardY(key, i)
        if (y >= cy && y <= cy + CH) return { key, index: i }
      }
      if (!pile.length && y >= TAB_Y && y <= TAB_Y + CH) return { key, index: 0 }
    } else if (y >= TOP_Y && y <= TOP_Y + CH) return { key, index: pile.length - 1 }
  }
  return null
}

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return { x: ((event.clientX - rect.left) * canvas.width) / rect.width, y: ((event.clientY - rect.top) * canvas.height) / rect.height }
}

canvas.addEventListener('pointerdown', (event) => {
  const p = toCanvas(event)
  if (won) return deal()
  const h = hit(p.x, p.y)
  if (!h) return
  if (h.key === 'stock') return flipStock()
  const pile = piles[h.key]
  if (h.index < 0 || !pile[h.index] || !pile[h.index].up) return
  if (h.key === 'waste' || h.key[0] === 'f') h.index = pile.length - 1 // only the top card of these
  const cx = pileX(h.key)
  const cy = cardY(h.key, h.index)
  drag = { from: h.key, index: h.index, dx: p.x - cx, dy: p.y - cy, x: p.x, y: p.y, moved: false }
})

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return
  const p = toCanvas(event)
  if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true
  drag.x = p.x
  drag.y = p.y
})

document.addEventListener('pointerup', () => {
  if (!drag) return
  const { from, index, moved } = drag
  if (!moved) autoMove(from, index)
  else {
    // Drop on the pile under the middle of the held card.
    const target = hit(drag.x - drag.dx + CW / 2, drag.y - drag.dy + CH / 2)
    if (target) tryMove(from, index, target.key)
  }
  drag = null
})

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') flipStock()
  else if (event.key === 'n' || event.key === 'N') deal()
  else return
  event.preventDefault()
})

function drawCardAt(card, x, y) {
  ctx.fillStyle = card.up ? '#ffffff' : '#1d4ed8'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = '#0f172a'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)
  if (!card.up) return
  ctx.fillStyle = isRed(card) ? '#dc2626' : '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(RANKS[card.rank] + SUITS[card.suit], x + 4, y + 16)
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(SUITS[card.suit], x + CW / 2, y + 54)
}

function draw() {
  ctx.fillStyle = '#166534'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const [key, pile] of Object.entries(piles)) {
    const x = pileX(key)
    // An empty place shows as an outline.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
    const hidden = drag && drag.from === key ? drag.index : pile.length
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, hidden - 1)
    for (let i = first; i < hidden; i++) drawCardAt(pile[i], x, cardY(key, i))
  }
  // The held cards follow the pointer, on top of everything.
  if (drag) {
    piles[drag.from].slice(drag.index).forEach((card, i) => drawCardAt(card, drag.x - drag.dx, drag.y - drag.dy + i * UP_STEP))
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves + '  Time ' + Math.floor(frames / 60), LEFT, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best ? best + 's' : '-'), canvas.width - LEFT, 24)
  if (won) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fillRect(60, 240, canvas.width - 120, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('You won in ' + moves + ' moves!', canvas.width / 2, 275)
    ctx.font = '15px sans-serif'
    ctx.fillText('Tap for a new game', canvas.width / 2, 302)
  }
}

function loop() {
  if (!won) frames += 1
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
