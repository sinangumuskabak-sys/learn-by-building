---
title: The deal
title_tr: Dağıtım
skills: [prog.arrays, game.canvas]
---

# --explanation--

Klondike, the solitaire everyone knows, is a game of **piles**. Thirteen of them:

- the **stock**, face down, and the **waste** next to it;
- four **foundations**, where you build each suit up from the ace;
- seven **tableau** columns: column 1 gets one card, column 2 two, up to seven, and only the last card of each is face up.

We keep them all in one object, `piles`, with short names as keys: `stock`, `waste`, `f0` to `f3`, `t0` to `t6`. Each is an array
of cards, `{ rank, suit, up }`. The key's first letter says what kind of pile it is, which the rules will use a lot:
`key[0] === 't'` means "a tableau column".

`deck.splice(0, i + 1)` cuts the first `i + 1` cards off the shuffled deck for column `i`; after the seven columns, whatever is
left (24 cards) is the stock.

In a tableau column, cards overlap: a face-down card only shows a thin edge (8 pixels), a face-up one enough to read it (22
pixels). So the y of a card depends on the cards above it, which `cardY` adds up. Empty places are drawn as faint outlines, so the
table shows where cards can go.

# --explanation-tr--

Herkesin bildiği solitaire olan Klondike bir **yığınlar** oyunudur. On üç tane:

- kapalı **deste** ve yanında **atık**;
- her rengi astan başlayarak yukarı dizdiğin dört **temel**;
- yedi **tablo** sütunu: 1. sütun bir kart, 2. sütun iki kart, yediye kadar alır ve her birinin yalnızca son kartı açıktır.

Hepsini tek bir nesnede, `piles`'ta, kısa adları anahtar yaparak tutarız: `stock`, `waste`, `f0`'dan `f3`'e, `t0`'dan `t6`'ya. Her
biri bir kart dizisidir, `{ rank, suit, up }`. Anahtarın ilk harfi yığının türünü söyler ve kurallar bunu çok kullanacak:
`key[0] === 't'`, "bir tablo sütunu" demektir.

`deck.splice(0, i + 1)`, `i` sütunu için karıştırılmış destenin ilk `i + 1` kartını keser; yedi sütundan sonra kalanlar (24 kart)
destedir.

Bir tablo sütununda kartlar üst üste biner: kapalı bir kart yalnızca ince bir kenar (8 piksel), açık bir kart okunacak kadarını (22
piksel) gösterir. Yani bir kartın y'si üstündeki kartlara bağlıdır ve `cardY` bunları toplar. Boş yerler soluk çerçeveler olarak
çizilir; böylece masa kartların nereye gidebileceğini gösterir.

# --task--

1. Add `SUITS`, `RANKS` (`['', 'A', '2', ..., '10', 'J', 'Q', 'K']`), `CW = 56`, `CH = 78`, `LEFT = 16`, `COL = 64`, `TOP_Y = 40`,
   `TAB_Y = 136`, `DOWN_STEP = 8`, `UP_STEP = 22`, and `isRed`, `last(pile)` and `colX(i) = LEFT + i * COL`.
2. Write `newDeck()` (52 cards face down, shuffled) and `deal()` as described.
3. Write `pileX(key)` (stock column 0, waste column 1, foundations columns 3 to 6, tableau column `i`) and `cardY(key, index)`.
4. Draw the green table (`'#166534'`), an outline (`'rgba(255, 255, 255, 0.35)'`, width 2) for every pile, every tableau card,
   and only the top card of the other piles. A card is white with its rank and suit (`'bold 14px sans-serif'` at `x + 4, y + 16`)
   and a big suit (`'28px sans-serif'`, centered at `y + 54`), red for ♥ and ♦; face down it is `'#1d4ed8'`.

# --task-tr--

1. `SUITS`, `RANKS` (`['', 'A', '2', ..., '10', 'J', 'Q', 'K']`), `CW = 56`, `CH = 78`, `LEFT = 16`, `COL = 64`, `TOP_Y = 40`,
   `TAB_Y = 136`, `DOWN_STEP = 8`, `UP_STEP = 22` ile `isRed`, `last(pile)` ve `colX(i) = LEFT + i * COL`'u ekle.
2. `newDeck()`'i (52 kapalı kart, karıştırılmış) ve `deal()`'ı anlatıldığı gibi yaz.
3. `pileX(key)`'i (deste 0. sütun, atık 1. sütun, temeller 3'ten 6'ya sütunlar, tablo `i` sütunu) ve `cardY(key, index)`'i yaz.
4. Yeşil masayı (`'#166534'`), her yığın için bir çerçeveyi (`'rgba(255, 255, 255, 0.35)'`, kalınlık 2), her tablo kartını ve diğer
   yığınların yalnızca üst kartını çiz. Bir kart; değeri ve rengi (`x + 4, y + 16`'da `'bold 14px sans-serif'`) ve büyük bir renk
   simgesiyle (`y + 54`'te ortalı `'28px sans-serif'`) beyazdır, ♥ ve ♦ için kırmızı; kapalıyken `'#1d4ed8'`'dir.

# --tests--

The deal should give columns of 1 to 7 cards with only the last face up, and 24 to the stock.
tr: Dağıtım yalnızca sonuncusu açık 1'den 7'ye kartlık sütunlar ve desteye 24 kart vermeli.

```js
const deck = newDeck()
assert.lengthOf(deck, 52)
assert.lengthOf(new Set(deck.map((card) => card.rank + '/' + card.suit)), 52, 'every card once')
for (let i = 0; i < 7; i++) {
  const pile = piles['t' + i]
  assert.lengthOf(pile, i + 1)
  assert.deepEqual(pile.map((card) => card.up), [...Array(i).fill(false), true], 'only the last card face up')
}
assert.lengthOf(piles.stock, 24)
assert.lengthOf(piles.waste, 0)
for (let f = 0; f < 4; f++) assert.lengthOf(piles['f' + f], 0)
```

Face-down cards should overlap more than face-up ones, and the piles should sit in their columns.
tr: Kapalı kartlar açıklardan daha çok üst üste binmeli ve yığınlar kendi sütunlarında durmalı.

```js
assert.strictEqual(cardY('t3', 3), 136 + 3 * 8, 'three face-down cards above it')
assert.strictEqual(cardY('f2', 0), 40)
piles.t3[3].up = true
piles.t3.push({ rank: 5, suit: 1, up: true })
assert.strictEqual(cardY('t3', 4), 136 + 3 * 8 + 22, 'face-up cards show more')
assert.deepEqual([pileX('stock'), pileX('waste'), pileX('f0'), pileX('f3'), pileX('t6')], [16, 80, 208, 400, 400])
```

The face-down cards, the face-up cards and their names should be drawn.
tr: Kapalı kartlar, açık kartlar ve adları çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#1d4ed8'), 21 + 1, 'the face-down cards and the top of the stock')
assert.lengthOf($.rects('#ffffff'), 7, 'seven face-up cards')
const card = piles.t0[0]
assert.include($.texts(), RANKS[card.rank] + SUITS[card.suit])
assert.deepInclude($.rects('#ffffff'), { x: 16, y: 136, w: 56, h: 78, color: '#ffffff' })
```

# --seed--

```js
// Solitaire, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
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
