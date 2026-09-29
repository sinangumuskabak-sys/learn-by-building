---
title: What is under the pointer?
title_tr: İşaretçinin altında ne var?
skills: [game.input, game.collision]
---

# --goal--

To play with the mouse or a finger we must know which pile is at a point. `hit(x, y)` checks each pile: is `x` inside
its column and `y` inside its card? We start with the top row.

# --goal-tr--

Fareyle ya da parmakla oynamak için şu soruyu cevaplamalıyız: "(x, y) noktasında **hangi yığın**, hangi kart var?"
`hit` (vuruş) fonksiyonu yığınları tek tek deneyecek: nokta bu yığının sütununda mı, kartın içinde mi?

Önce üst sırayla (deste, açılan kartlar, temeller) başlıyoruz; sütunlar bir sonraki adımda.

# --code--

```js
// Which card, or which empty pile, is at (x, y)? The card drawn last, on top, wins.
function hit(x, y) {
  for (const key of Object.keys(piles)) {
    const px = pileX(key)
    if (x < px || x > px + CW) continue
    const pile = piles[key]
    if (key[0] !== 't' && y >= TOP_Y && y <= TOP_Y + CH) return { key, index: pile.length - 1 }
  }
  return null
}
```

# --meaning--

- `Object.keys(piles)` lists the pile names.
- `continue` skips to the next pile when `x` is left or right of this one.
- In the top row, a point between `TOP_Y` and `TOP_Y + CH` hits the pile; the answer is its name and the index of its top
  card.
- `return null` means "nothing here".

# --meaning-tr--

- `Object.keys(piles)` → nesnenin **anahtarları**: `['stock', 'waste', 'f0', ...]`.
- `if (x < px || x > px + CW) continue` → nokta bu yığının solunda **veya** sağındaysa, `continue` döngünün bu turunu
  bırakıp **sıradaki yığına** geçer.
- `const pile = piles[key]` → yığının kartları.
- `if (key[0] !== 't' && y >= TOP_Y && y <= TOP_Y + CH)` → `&&` "**ve**": sütun değilse **ve** y kartın üst ile alt
  kenarı arasındaysa...
- `return { key, index: pile.length - 1 }` → ...cevap: yığının adı ve üst kartın sırası. Boş yığında bu −1 olur.
- `return null` → döngü bitti, hiçbir şeye denk gelmedi. `null` "hiçbir şey" demek.

# --task--

Above the `keydown` listener write `hit` with its comment, and leave an empty line between them.

# --task-tr--

`document.addEventListener('keydown', ...)` satırının **üstüne** yorumuyla birlikte `hit` fonksiyonunu yaz; aralarında
bir boş satır kalsın. **Çalıştır**.

# --hint--

`||` (or) for the x check: left **or** right means outside. `&&` (and) for the y check: below the top **and** above the bottom.

# --hint-tr--

x kontrolünde `||` (veya): solunda **veya** sağında ise dışarıda. y kontrolünde `&&` (ve): üst kenarın altında **ve** alt kenarın üstünde.

# --tests--

`hit` should find the stock, the waste and a foundation.
tr: `hit` desteyi, atığı ve bir temeli bulmalı.

```js
assert.deepEqual(hit(44, 60), { key: 'stock', index: 23 })
assert.strictEqual(hit(100, 60).key, 'waste')
assert.strictEqual(hit(240, 100).key, 'f0')
```

A point between columns or above the cards should hit nothing.
tr: Sütunların arası ya da kartların üstü hiçbir şeye denk gelmemeli.

```js
assert.isNull(hit(16 + 58, 60), 'the gap between the stock and the waste')
assert.isNull(hit(44, 30), 'above the cards')
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
    if (key[0] !== 't' && y >= TOP_Y && y <= TOP_Y + CH) return { key, index: pile.length - 1 }
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
