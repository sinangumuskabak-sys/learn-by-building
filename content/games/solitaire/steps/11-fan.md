---
title: Fan out the columns
title_tr: Sütunları kaydır
skills: [prog.functions, game.canvas]
---

# --goal--

In a real game the cards of a column overlap: a face-down card shows a thin 8-pixel edge, a face-up one 22 pixels, enough
to read it. `cardY` adds up the cards above to find each card's y.

# --goal-tr--

Gerçek masada sütunun kartları **üst üste biner** ama her birinin bir kısmı görünür: kapalı kartın yalnız 8 piksellik
ince kenarı, açık kartın ise okunacak kadar 22 pikseli.

Bir kartın y'sini bulmak için **üstündeki kartları** sayacağız: her kapalı kart 8, her açık kart 22 piksel aşağı
iter. Bu işi `cardY` (kartın y'si) yapacak.

# --code--

```js
const DOWN_STEP = 8 // how much of a face-down card shows under the next one
const UP_STEP = 22

// The y of card `index` in a tableau column: face-down cards overlap more than face-up ones.
function cardY(key, index) {
  if (key[0] !== 't') return TOP_Y
  let y = TAB_Y
  const pile = piles[key]
  for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP
  return y
}

    for (let i = first; i < pile.length; i++) drawCardAt(pile[i], x, cardY(key, i))
```

# --meaning--

- Piles that are not columns (`!==` means "is not") are always at `TOP_Y`.
- For a column, start at `TAB_Y` and, for every card above this one, add 22 if it is face up, 8 if not.
- `draw` now asks `cardY` for each card's y.

# --meaning-tr--

- `DOWN_STEP = 8`, `UP_STEP = 22` → kapalı ve açık kartın altından ne kadarının görüneceği.
- `if (key[0] !== 't') return TOP_Y` → `!==` "**eşit değil**": sütun olmayan yığınlar hep üst sırada.
- `let y = TAB_Y` → sütunun başından başla.
- `const pile = piles[key]` → o sütunun kartları.
- `for (let i = 0; i < index; i++) y += pile[i].up ? UP_STEP : DOWN_STEP` → bu karttan **önceki** her kart için y'ye
  ekle: açıksa 22, kapalıysa 8. `+=` "üstüne ekle".
- `return y` → toplanan y.
- `draw` içinde y artık `cardY(key, i)`'den geliyor.

# --task--

1. Under `TAB_Y` write `DOWN_STEP` and `UP_STEP`.
2. Under `pileX`, leave an empty line and write `cardY` with its comment.
3. In `draw`, replace the last argument of `drawCardAt(...)` with `cardY(key, i)`. Press **Run**.

# --task-tr--

1. `const TAB_Y = ...` satırının altına `DOWN_STEP` ve `UP_STEP` satırlarını yaz.
2. `pileX` fonksiyonunun altına bir boş satır bırak ve yorumuyla birlikte `cardY` fonksiyonunu yaz.
3. `draw` içinde `drawCardAt(pile[i], x, key[0] === 't' ? TAB_Y : TOP_Y)` kısmındaki son parçayı (`key[0] === 't' ?
   TAB_Y : TOP_Y`) sil, yerine `cardY(key, i)` yaz.
4. **Çalıştır**: sütunlar artık merdiven gibi aşağı iniyor; kapalı kartların ince mavi kenarları görünüyor.

# --try--

Set `DOWN_STEP` to `20`: the face-down cards spread out. Put 8 back.

# --try-tr--

`DOWN_STEP`'i `20` yap: kapalı kartlar açılıp yayılır. Sonra 8'e geri al.

# --tests--

Face-down cards should overlap more than face-up ones.
tr: Kapalı kartlar açıklardan daha çok üst üste binmeli.

```js
assert.strictEqual(cardY('t3', 0), 136)
assert.strictEqual(cardY('t3', 3), 136 + 3 * 8, 'three face-down cards above it')
assert.strictEqual(cardY('f2', 0), 40)
piles.t3[3].up = true
piles.t3.push({ rank: 5, suit: 1, up: true })
assert.strictEqual(cardY('t3', 4), 136 + 3 * 8 + 22, 'face-up cards show more')
```

The face-up card of the last column should be drawn 6 edges lower.
tr: Son sütunun açık kartı 6 kenar aşağıda çizilmeli.

```js
$.tick(1)
assert.deepInclude($.rects('#ffffff'), { x: 400, y: 136 + 6 * 8, w: 56, h: 78, color: '#ffffff' })
assert.lengthOf($.rects('#1d4ed8'), 21 + 1, 'the face-down cards and the top of the stock')
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
