---
title: Tap to move
title_tr: Dokun ve taşı
skills: [game.input, game.state]
---

# --explanation--

Now cards move. `tryMove(from, index, to)` moves the card at `index` **and everything on top of it** from one pile to another, if
the rules allow it:

- to a foundation, only a single card that `canFound`;
- to a tableau column, a card that `canStack` (with the cards above it riding along, since they are already in order);
- never onto the stock or the waste.

`piles[from].splice(index)` cuts the cards off the source and returns them, and `push(...cards)` puts them on the target. Then, if
a face-down card has been uncovered in a tableau column, it turns face up.

The quickest way to play on any device is to **tap** a card and let the game find where it goes. `autoMove` tries the foundations
first (that is almost always the best move), then the tableau columns, and stops at the first that works. `Array.some` does
exactly that: it calls the function for each target and stops at the first `true`.

A press remembers which card was pressed; letting go makes the move. That split is what the next step builds dragging on.

# --explanation-tr--

Artık kartlar hareket ediyor. `tryMove(from, index, to)`, kurallar izin veriyorsa `index`'teki kartı **ve üstündeki her şeyi** bir
yığından diğerine taşır:

- bir temele yalnızca `canFound` olan tek bir kart;
- bir tablo sütununa `canStack` olan bir kart (üstündeki kartlar zaten sıralı oldukları için onunla birlikte gelir);
- asla desteye ya da atığa.

`piles[from].splice(index)` kartları kaynaktan keser ve döndürür, `push(...cards)` onları hedefe koyar. Sonra bir tablo sütununda kapalı
bir kart açığa çıktıysa açılır.

Her cihazda oynamanın en hızlı yolu bir karta **dokunmak** ve gideceği yeri oyunun bulmasına bırakmaktır. `autoMove` önce temelleri
(bu neredeyse her zaman en iyi hamledir), sonra tablo sütunlarını dener ve işe yarayan ilkinde durur. `Array.some` tam bunu yapar:
fonksiyonu her hedef için çağırır ve ilk `true`'da durur.

Bir basış hangi karta basıldığını hatırlar; bırakmak hamleyi yapar. Sonraki adım sürüklemeyi bu ayrım üzerine kurar.

# --task--

1. Add `moves` (`0` in `deal()`); turning over the stock is a move too.
2. Write `tryMove(from, index, to)` as described: return `false` if it is not allowed; otherwise move the cards, turn over an
   uncovered tableau card, add 1 to `moves` and return `true`.
3. Write `autoMove(from, index)`: try `f0` to `f3`, then `t0` to `t6`, and stop at the first move that works.
4. Add `drag`. On `pointerdown` on a face-up card (for the waste and the foundations, always their top card), set
   `drag = { from, index }`; on the document's `pointerup`, `autoMove` it and clear `drag`.
5. Draw `Moves 3` at `(LEFT, 24)` (white, `'bold 15px sans-serif'`).

# --task-tr--

1. `moves` ekle (`deal()`'da `0`); desteyi çevirmek de bir hamledir.
2. `tryMove(from, index, to)`'yu anlatıldığı gibi yaz: izin verilmiyorsa `false` döndür; değilse kartları taşı, açığa çıkan bir tablo
   kartını aç, `moves`'a 1 ekle ve `true` döndür.
3. `autoMove(from, index)` yaz: `f0`'dan `f3`'e, sonra `t0`'dan `t6`'ya dene ve işe yarayan ilk hamlede dur.
4. `drag` ekle. Açık bir kartta `pointerdown`'da (atık ve temeller için her zaman üst kartları) `drag = { from, index }` yap;
   document'ın `pointerup`'ında onu `autoMove` et ve `drag`'i temizle.
5. `(LEFT, 24)`'e `Moves 3` çiz (beyaz, `'bold 15px sans-serif'`).

# --tests--

A tapped card should move to where it fits and count as a move.
tr: Dokunulan bir kart uyduğu yere gitmeli ve bir hamle sayılmalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(13, 0)]
piles.t1 = [c(12, 1)]
$.click(16 + 64 + 20, 136 + 30)
assert.lengthOf(piles.t0, 2, 'a tap moves the queen onto the king')
assert.lengthOf(piles.t1, 0)
assert.strictEqual(moves, 1)
$.tick(1)
assert.include($.texts(), 'Moves 1')
```

Aces should go to a foundation first, and the card under them should turn over.
tr: Aslar önce bir temele gitmeli ve altlarındaki kart açılmalı.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t2 = [c(5, 3, false), c(1, 2)]
$.click(16 + 128 + 20, 136 + 8 + 30)
assert.deepEqual(piles.f0.map((card) => card.rank), [1], 'an ace goes to a foundation')
assert.isTrue(piles.t2[0].up, 'the card under it turns over')
piles.waste = [c(2, 2)]
$.click(80 + 20, 60)
assert.lengthOf(piles.f0, 2, 'the waste top card too')
```

A card with nowhere to go, or a face-down card, should not move.
tr: Gidecek yeri olmayan bir kart ya da kapalı bir kart hareket etmemeli.

```js
const c = (rank, suit, up = true) => ({ rank, suit, up })
const clear = () => {
  for (const k of Object.keys(piles)) piles[k] = []
}
clear()
piles.t0 = [c(7, 0, false), c(9, 0)]
piles.t1 = [c(4, 3)]
$.click(16 + 20, 136 + 8 + 30)
$.click(16 + 64 + 20, 136 + 30)
$.click(16 + 20, 136 + 3)
assert.lengthOf(piles.t0, 2, 'nowhere to go: nothing moves')
assert.strictEqual(moves, 0)
assert.isFalse(tryMove('t0', 1, 'f0'))
assert.isFalse(tryMove('t0', 1, 'waste'), 'never onto the waste')
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
let drag // { from, index } between pressing on a card and letting go
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
  drag = null
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
  const h = hit(p.x, p.y)
  if (!h) return
  if (h.key === 'stock') return flipStock()
  const pile = piles[h.key]
  if (h.index < 0 || !pile[h.index] || !pile[h.index].up) return
  if (h.key === 'waste' || h.key[0] === 'f') h.index = pile.length - 1 // only the top card of these
  drag = { from: h.key, index: h.index }
})

document.addEventListener('pointerup', () => {
  if (!drag) return
  autoMove(drag.from, drag.index)
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
