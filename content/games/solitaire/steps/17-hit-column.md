---
title: Hitting a card in a column
title_tr: Sütunda bir karta dokunmak
skills: [game.collision]
---

# --goal--

In a column the cards overlap, so a point can be inside several of them. The one drawn last is on top, so we test from the
**last** card down, and the first match wins.

# --goal-tr--

Sütunda kartlar üst üste bindiği için bir nokta **birden çok kartın** içine düşebilir. Hangisine dokunduk? **Üstte
görünene**: yani en son çizilene.

Bu yüzden kartları **sondan başa** doğru deneyeceğiz; ilk tutan kart cevaptır. Örtülü bir kartın yalnız görünen ince
kenarına dokunursan, üstündeki kartlar o noktayı kapsamadığı için o kart bulunur.

# --code--

```js
if (key[0] === 't') {
  for (let i = pile.length - 1; i >= 0; i--) {
    const cy = cardY(key, i)
    if (y >= cy && y <= cy + CH) return { key, index: i }
  }
} else if (y >= TOP_Y && y <= TOP_Y + CH) return { key, index: pile.length - 1 }
```

# --meaning--

- For a column, the loop runs `i` from the last card down to 0 and returns the first card whose rectangle contains `y`.
- `else if` handles the top row as before.

# --meaning-tr--

- `if (key[0] === 't') {` → yığın bir sütunsa:
  - `for (let i = pile.length - 1; i >= 0; i--)` → son karttan ilk karta doğru, **geriye**.
  - `const cy = cardY(key, i)` → bu kartın üst kenarı.
  - `if (y >= cy && y <= cy + CH) return { key, index: i }` → nokta kartın içindeyse cevap bu kart. İlk bulunan en üstteki.
- `} else if (...)` → sütun değilse, önceki adımdaki üst sıra kontrolü. `else if` "değilse, şu doğruysa" demek; artık
  `key[0] !== 't'` yazmaya gerek yok.

# --task--

In `hit`, replace the `if (key[0] !== 't' && ...)` line with the new lines.

# --task-tr--

`hit` içindeki `if (key[0] !== 't' && y >= TOP_Y ...` satırını sil; yerine yeni altı satırı yaz. **Çalıştır**.

# --predict--

If the loop went from the first card up instead, what would a tap on the face-up card of column 3 hit?
- [x] A face-down card under it
  The first card's rectangle also contains that point, and it would be found first.
- [ ] The face-up card
- [ ] Nothing

# --predict-tr--

Döngü ilk karttan sona doğru gitseydi, 3. sütunun açık kartına dokununca ne bulunurdu?
- [x] Altındaki kapalı bir kart
  İlk kartın dikdörtgeni de o noktayı kapsıyor ve önce o denenirdi.
- [ ] Açık kart
- [ ] Hiçbir şey

# --tests--

`hit` should find the card on top and the edge of a covered card.
tr: `hit` üstteki kartı ve örtülü bir kartın kenarını bulmalı.

```js
assert.deepEqual(hit(16 + 128 + 10, 136 + 4), { key: 't2', index: 0 }, 'the visible edge of a covered card')
assert.deepEqual(hit(16 + 128 + 10, 136 + 16 + 40), { key: 't2', index: 2 }, 'the card on top wins')
assert.isNull(hit(16 + 58, 300), 'the gap between columns')
```

The top row should still work.
tr: Üst sıra yine çalışmalı.

```js
assert.deepEqual(hit(44, 60), { key: 'stock', index: 23 })
assert.isNull(hit(44, 125), 'between the rows')
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
