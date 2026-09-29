---
title: Follow the pointer
title_tr: İşaretçiyi izle
skills: [game.input]
---

# --goal--

While a card is held, every pointer move updates `drag.x` and `drag.y`. A move of more than 4 pixels marks it as a real
drag; a finger always wobbles a little, and that should still be a tap.

# --goal-tr--

Kart tutulurken parmak her kıpırdadığında yeni yerini `drag.x` ve `drag.y`'ye yazacağız.

Bir de şunu ayırmalıyız: bu bir **dokunuş** mu, **sürükleme** mi? Parmak dokunurken bile biraz titrer. Bu yüzden 4
pikselden fazla kayarsa "gerçekten sürükledi" diyeceğiz: `moved = true`.

# --code--

```js
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return
  const p = toCanvas(event)
  if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true
  drag.x = p.x
  drag.y = p.y
})
```

# --meaning--

- Moves without a held card are ignored.
- `Math.hypot(a, b)` is the length of the line with sides `a` and `b` (Pythagoras): the distance between the last point and
  the new one.
- Then the new position is stored.

# --meaning-tr--

- `canvas.addEventListener('pointermove', ...)` → işaretçi canvas üstünde her **kıpırdadığında** çalışır.
- `if (!drag) return` → elde kart yoksa ilgilenmiyoruz.
- `Math.hypot(p.x - drag.x, p.y - drag.y)` → iki nokta arasındaki **uzaklık**. Yatayda 3, dikeyde 4 kaydıysa uzaklık
  √(3² + 4²) = 5 (Pisagor). `Math.hypot` bu hesabı bizim için yapar.
- `> 4` → 4 pikselden fazla kaydıysa `drag.moved = true`: artık bir sürükleme.
- `drag.x = p.x`, `drag.y = p.y` → yeni yeri kaydet.

# --task--

Under the `pointerdown` listener, leave an empty line and write the `pointermove` listener.

# --task-tr--

`pointerdown` dinleyicisinin kapanan `})` satırının altına bir boş satır bırak ve `pointermove` dinleyicisini yaz.
**Çalıştır**.

# --predict--

You press a card and drag it across the table. What does the card do?
- [ ] It follows the pointer
- [x] It stays where it is
  `drag` knows where the pointer is, but `draw` does not use it yet.
- [ ] It disappears

# --predict-tr--

Bir karta basıp masada sürüklüyorsun. Kart ne yapar?
- [ ] İşaretçiyi izler
- [x] Yerinde durur
  `drag` işaretçinin yerini biliyor ama `draw` onu henüz kullanmıyor.
- [ ] Kaybolur

# --tests--

Moving should update the pointer, and more than 4 pixels should count as a drag.
tr: Kıpırdamak işaretçiyi güncellemeli; 4 pikselden fazlası sürükleme sayılmalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(9, 0)]
$.pointerDown(36, 166)
$.move(38, 167)
assert.deepEqual([drag.x, drag.y], [38, 167])
assert.isFalse(drag.moved, 'a 2-pixel wobble is still a tap')
$.move(80, 200)
assert.deepEqual([drag.x, drag.y], [80, 200])
assert.isTrue(drag.moved)
```

Moving without a held card should do nothing.
tr: Elde kart yokken kıpırdamak bir şey yapmamalı.

```js
$.move(100, 100)
assert.notOk(drag)
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

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return
  const p = toCanvas(event)
  if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) drag.moved = true
  drag.x = p.x
  drag.y = p.y
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
