---
title: Where did you grab it?
title_tr: Kartı nereden tuttun?
skills: [game.input]
---

# --goal--

Sometimes you want a different place than the one a tap picks, so cards can also be dragged. First, `drag` remembers where
the card was grabbed: `dx, dy`, the pointer's offset from the card's corner, and the pointer itself, `x, y`.

# --goal-tr--

Dokunmak kartı **ilk** uyduğu yere gönderiyor. Ama bazen başka bir yer istersin, mesela iki papazdan **ikincisinin**
üstü. Bu yüzden kartları **sürükleyerek** de taşıyacağız.

Önce kartı **nereden tuttuğumuzu** hatırlamalıyız. Kartı ortasından tutarsan sürüklerken de ortasından tutmaya devam
etmelisin; yoksa kart zıplar ve köşesi parmağının altına gelir. Bu farka `dx`, `dy` diyeceğiz.

# --code--

```js
const cx = pileX(h.key)
const cy = cardY(h.key, h.index)
drag = { from: h.key, index: h.index, dx: p.x - cx, dy: p.y - cy, x: p.x, y: p.y, moved: false }
```

# --meaning--

- `cx, cy` is the held card's top-left corner.
- `dx, dy` is how far the pointer is from that corner; it stays the same while dragging.
- `x, y` is where the pointer is now; `moved` will tell a drag from a tap.

# --meaning-tr--

- `const cx = pileX(h.key)`, `const cy = cardY(h.key, h.index)` → tutulan kartın **sol üst köşesi**.
- `dx: p.x - cx`, `dy: p.y - cy` → parmağın kartın köşesinden ne kadar **sağda ve aşağıda** olduğu. Kartı sürüklerken
  bu fark hep aynı kalacak.
- `x: p.x, y: p.y` → parmağın **şu anki** yeri; sürükledikçe güncellenecek.
- `moved: false` → henüz kıpırdamadı. Kıpırdamazsa bu bir **dokunuş** sayılacak.

# --task--

In the `pointerdown` listener, replace the last line (`drag = { from: h.key, index: h.index }`) with the three lines.

# --task-tr--

`pointerdown` dinleyicisinin son satırını (`drag = { from: h.key, index: h.index }`) sil; yerine üç satırı yaz.
**Çalıştır**: dokunarak oynamak eskisi gibi çalışmalı.

# --tests--

`drag` should remember the grab offset and the pointer.
tr: `drag` tutma farkını ve işaretçiyi hatırlamalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(7, 0, false), c(9, 0)]
$.pointerDown(16 + 20, 136 + 8 + 30)
assert.deepEqual(drag, { from: 't0', index: 1, dx: 20, dy: 30, x: 36, y: 174, moved: false })
```

A tap should still move a card.
tr: Dokunmak yine kart taşımalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(12, 1)]
$.click(16 + 64 + 5, 136 + 70)
assert.lengthOf(piles.t0, 2)
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
  moves = 0
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
  return true
}

// A tap sends a card to the best place it can go: a foundation first, then a tableau column.
function autoMove(from, index) {
  const targets = ['f0', 'f1', 'f2', 'f3', 't0', 't1', 't2', 't3', 't4', 't5', 't6']
  return targets.some((to) => tryMove(from, index, to))
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

document.addEventListener('pointerup', () => {
  if (!drag) return
  const { from, index } = drag
  autoMove(from, index)
  drag = null
})

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') flipStock()
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
    // The stock, the waste and the foundations only need their top card.
    const first = key[0] === 't' ? 0 : Math.max(0, pile.length - 1)
    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, cardY(key, i))
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Moves ' + moves, LEFT, 24)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
