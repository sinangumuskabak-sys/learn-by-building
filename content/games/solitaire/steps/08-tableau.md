---
title: Deal the seven columns
title_tr: Yedi sütunu dağıt
skills: [prog.arrays]
---

# --goal--

Column 1 gets one card, column 2 two, up to seven cards in column 7, and only the last card of each is face up. What is
left (24 cards) stays in the stock.

# --goal-tr--

Klondike'ın dağıtımı: 1. sütuna **1** kart, 2.'ye **2**, ... 7.'ye **7** kart. Her sütunda yalnız **en son kart
açık**, altındakiler kapalı. Toplam 1 + 2 + ... + 7 = 28 kart; kalan **24 kart** destede kalır.

Kartları desteden kesip sütunlara koyacağız. Son kartı bulmak için de küçük bir yardımcı yazacağız: `last`.

# --code--

```js
const last = (pile) => pile[pile.length - 1]

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
```

# --meaning--

- `last(pile)` returns the last card: an array of length 5 has its last item at index 4.
- `deck.splice(0, i + 1)` cuts `i + 1` cards off the start of the deck and returns them; the deck gets shorter.
- `last(...).up = true` turns the column's last card face up.

# --meaning-tr--

- `const last = (pile) => pile[pile.length - 1]` → yığının **son** (en üstteki) kartı. `pile.length` eleman sayısı;
  sayma 0'dan başladığı için 5 elemanlı dizinin sonuncusu 4. sırada.
- `for (let i = 0; i < 7; i++)` → yedi sütun: `i` 0'dan 6'ya.
- `piles['t' + i] = deck.splice(0, i + 1)` → `splice(0, i + 1)` destenin **başından** `i + 1` kartı **kesip alır**
  ve geri verir; deste o kadar kısalır. 0. sütun 1 kart, 6. sütun 7 kart alır.
- `last(piles['t' + i]).up = true` → sütunun son kartını **açar**.
- Döngü bitince destede 52 − 28 = 24 kart kalır; `piles.stock = deck` onu yine desteye koyar.
- Üstteki yorum satırı fonksiyonun ne yaptığını kısaca anlatır.

# --task--

1. Under the `isRed` line write `last`.
2. Put the comment line above `function deal() {`.
3. In `deal`, under the foundations line, write the `for` loop for the columns.

# --task-tr--

1. `const isRed = ...` satırının hemen altına `last` satırını yaz.
2. `function deal() {` satırının üstüne yorum satırını ekle.
3. `deal` içinde temelleri açan `for (let f ...)` satırının altına sütunları dolduran `for` döngüsünü yaz.
4. **Çalıştır**. Ekran yine aynı; kartları bir sonraki adımlarda masaya yerleştireceğiz.

# --tests--

The deal should give columns of 1 to 7 cards with only the last face up, and 24 to the stock.
tr: Dağıtım yalnızca sonuncusu açık 1'den 7'ye kartlık sütunlar ve desteye 24 kart vermeli.

```js
for (let i = 0; i < 7; i++) {
  const pile = piles['t' + i]
  assert.lengthOf(pile, i + 1)
  assert.deepEqual(pile.map((card) => card.up), [...Array(i).fill(false), true], 'only the last card face up')
}
assert.lengthOf(piles.stock, 24)
```

`last` should return the last card of a pile.
tr: `last` bir yığının son kartını vermeli.

```js
assert.deepEqual(last([{ rank: 1, suit: 0 }, { rank: 9, suit: 2 }]), { rank: 9, suit: 2 })
assert.isUndefined(last([]))
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

let piles // stock, waste, f0..f3 (foundations) and t0..t6 (tableau): arrays of { rank, suit, up }

const isRed = (card) => card.suit === 1 || card.suit === 2
const last = (pile) => pile[pile.length - 1]

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

  drawCardAt({ rank: 12, suit: 1, up: true }, 16, 40)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

deal()
requestAnimationFrame(loop)
```
