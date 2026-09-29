---
title: Outlines for empty places
title_tr: Boş yerlere çerçeve
skills: [game.canvas]
---

# --goal--

The waste and the foundations are empty, so the table does not show where cards will go. Every pile gets a faint white
outline under its cards.

# --goal-tr--

Açılan kartların yeri ve dört temel şu an boş; masaya bakınca oralara kart gideceği anlaşılmıyor. Her yığının yerine,
kartlarının **altına**, soluk beyaz bir **çerçeve** çizeceğiz. Kart varsa çerçeveyi örter; yoksa çerçeve görünür.

# --code--

```js
// An empty place shows as an outline.
ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
ctx.lineWidth = 2
ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)
```

# --meaning--

- `rgba(255, 255, 255, 0.35)` is white (red, green and blue all 255) at 35% opacity.
- The outline is drawn before the cards, so a card covers it.

# --meaning-tr--

- `'rgba(255, 255, 255, 0.35)'` → renk dört sayıyla: kırmızı, yeşil, mavi (0–255) ve **saydamlık** (0–1). Üçü de 255
  → beyaz; 0.35 → yüzde 35 görünür, soluk bir beyaz.
- `ctx.lineWidth = 2` → 2 piksel kalınlık.
- `ctx.strokeRect(x, key[0] === 't' ? TAB_Y : TOP_Y, CW, CH)` → yığının yerinde kart büyüklüğünde bir çerçeve.
- Çerçeve kartlardan **önce** çizilir; kart varsa üstüne gelir ve onu örter.

# --task--

In `draw`, under `const x = pileX(key)`, write the four lines. Press **Run**.

# --task-tr--

`draw` içinde `const x = pileX(key)` satırının altına dört satırı yaz (dört boşluk içeriden). **Çalıştır**: üst
sırada boş yerlerin soluk çerçevelerini görmelisin.

# --tests--

Every pile should have a faint outline in its place.
tr: Her yığının yerinde soluk bir çerçeve olmalı.

```js
$.tick(1)
const outlines = $.screen().filter((c) => c.op === 'strokeRect' && c.stroke === 'rgba(255, 255, 255, 0.35)')
assert.lengthOf(outlines, 13)
const places = outlines.map((c) => c.args)
assert.deepInclude(places, [80, 40, 56, 78], 'the waste')
assert.deepInclude(places, [208, 40, 56, 78], 'the first foundation')
assert.deepInclude(places, [400, 136, 56, 78], 'the last column')
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
