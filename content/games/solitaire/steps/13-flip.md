---
title: Turn over a card
title_tr: Bir kart çevir
skills: [prog.arrays, game.state]
---

# --goal--

The first move of the game: take the top card of the stock, turn it face up and put it on the waste. `flipStock` does
exactly that.

# --goal-tr--

Oyunun ilk hamlesi: destenin **en üstteki** kartını al, **yüzünü çevir** ve yanındaki açık kartların üstüne koy.
Bunu `flipStock` (desteyi çevir) fonksiyonu yapacak.

Destenin "üstü" dizinin **sonu**: `deal` kartları sona doğru dizdi ve `draw` son kartı gösteriyor.

# --code--

```js
function flipStock() {
  if (piles.stock.length) {
    const card = piles.stock.pop()
    card.up = true
    piles.waste.push(card)
  }
}
```

# --meaning--

- `if (piles.stock.length)` is true when the stock has cards (0 counts as false).
- `pop()` removes the last card of an array and returns it; `push` puts it at the end of the waste.

# --meaning-tr--

- `if (piles.stock.length)` → destede kart **varsa**. `length` 0 ise JavaScript bunu "yanlış" sayar, başka her sayıyı
  "doğru".
- `const card = piles.stock.pop()` → `pop()` dizinin **son** elemanını çıkarır ve geri verir: destenin üst kartı.
- `card.up = true` → kartı aç.
- `piles.waste.push(card)` → açık kartların **sonuna**, yani üstüne koy.

# --task--

Under `cardY`, leave an empty line and write `flipStock`. Press **Run**.

# --task-tr--

`cardY` fonksiyonunun altına bir boş satır bırak ve `flipStock` fonksiyonunu yaz. **Çalıştır**.

# --predict--

What happens on the table after Run?
- [ ] A card appears next to the stock
- [x] Nothing: nobody calls `flipStock()` yet
  We wrote the recipe; the next step connects it to a key.
- [ ] The stock disappears

# --predict-tr--

Çalıştır'a basınca masada ne olur?
- [ ] Destenin yanında bir kart belirir
- [x] Hiçbir şey: `flipStock()`'u henüz kimse çağırmıyor
  Tarifi yazdık; bir sonraki adımda onu bir tuşa bağlayacağız.
- [ ] Deste kaybolur

# --tests--

`flipStock()` should move the top card of the stock onto the waste, face up.
tr: `flipStock()` destenin üst kartını açık olarak atığa taşımalı.

```js
const card = piles.stock[piles.stock.length - 1]
flipStock()
assert.lengthOf(piles.stock, 23)
assert.lengthOf(piles.waste, 1)
assert.strictEqual(piles.waste[0], card)
assert.isTrue(card.up)
```

The waste card should be drawn face up.
tr: Atıktaki kart açık çizilmeli.

```js
flipStock()
$.tick(1)
assert.deepInclude($.rects('#ffffff'), { x: 80, y: 40, w: 56, h: 78, color: '#ffffff' })
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
  }
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
