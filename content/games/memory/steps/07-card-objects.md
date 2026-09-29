---
title: Cards that know themselves
title_tr: Kendini bilen kartlar
skills: [prog.arrays, game.state]
---

# --goal--

A card is more than a fruit: it has a place on the grid and it is face up or not. `map` turns each fruit into a card
object with those fields.

# --goal-tr--

Bir kart sadece bir meyve değil. Kart şunları da bilmeli:

- tahtada **nerede** duruyor (sütun ve satır),
- **açık mı** (`faceUp`),
- eşi bulundu mu (`matched`).

Her meyveyi bu bilgileri taşıyan bir **nesneye** (kayıt) çevireceğiz. Bir kimlik kartı gibi: ad, adres, durum.

# --code--

```js
const deck = [...SYMBOLS, ...SYMBOLS]
cards = deck.map((symbol, index) => ({
  symbol,
  col: index % SIZE,
  row: Math.floor(index / SIZE),
  faceUp: false,
  matched: false,
}))
```

# --meaning--

- `deck.map(fn)` makes a new array by running `fn` on each item: here each fruit becomes a card object.
- `symbol` is the fruit, `index` its position 0 to 15. `{ symbol }` is short for `{ symbol: symbol }`.
- `index % SIZE` is the column (the remainder after dividing by 4), `Math.floor(index / SIZE)` the row.
- The object is wrapped in `( )` so the braces are not read as a function body.

# --meaning-tr--

- `const deck = [...SYMBOLS, ...SYMBOLS]` → 16'lık deste (önceki adımın listesi).
- `deck.map((symbol, index) => ...)` → `map` destedeki **her eleman** için küçük fonksiyonu çalıştırır ve sonuçlardan
  **yeni bir dizi** yapar. `=>` (ok) kısa fonksiyon yazımı; `symbol` meyve, `index` sırası (0–15).
- `({ ... })` → nesneyi `( )` içine alırız ki süslü parantez fonksiyon gövdesi sanılmasın.
- `symbol,` → kısaltma: `symbol: symbol` ile aynı.
- `col: index % SIZE` → `%` **bölümden kalan**: `6 % 4` = 2. Yani 6 numaralı kart 2. sütunda.
- `row: Math.floor(index / SIZE)` → `Math.floor` **aşağı yuvarlar**: 6 / 4 = 1.5 → 1. Yani 1. satırda.
- `faceUp: false` → açık mı? Hayır. `matched: false` → eşi bulundu mu? Hayır. `true`/`false` (doğru/yanlış) tırnaksız
  yazılır.

# --task--

In `newGame`, replace `cards = [...SYMBOLS, ...SYMBOLS]` with the new lines. Press **Run**.

# --task-tr--

1. `newGame` içindeki `cards = [...SYMBOLS, ...SYMBOLS]` satırını sil.
2. Yerine yeni satırları yaz. Sondaki `}))`'ye dikkat: `}` nesneyi, `)` nesneyi saran parantezi, son `)` da `map(`'i
   kapatır.
3. **Çalıştır**: ekran aynı kalmalı.

# --predict--

Card number 9: which column and row?
- [ ] Column 2, row 1
- [x] Column 1, row 2
  9 % 4 is 1 and Math.floor(9 / 4) is 2.
- [ ] Column 1, row 9

# --predict-tr--

9 numaralı kart: hangi sütun, hangi satır?
- [ ] 2. sütun, 1. satır
- [x] 1. sütun, 2. satır
  9 % 4 = 1 ve Math.floor(9 / 4) = 2.
- [ ] 1. sütun, 9. satır

# --tests--

There should be 16 card objects, every fruit twice.
tr: 16 kart nesnesi olmalı, her meyve iki kez.

```js
assert.lengthOf(cards, 16)
assert.sameMembers(cards.map((c) => c.symbol), [...SYMBOLS, ...SYMBOLS])
```

Each card should know its place on the grid and start face down.
tr: Her kart tahtadaki yerini bilmeli ve kapalı başlamalı.

```js
assert.include(cards[0], { col: 0, row: 0, faceUp: false, matched: false })
assert.include(cards[6], { col: 2, row: 1 })
assert.include(cards[15], { col: 3, row: 3 })
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards
const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']

let cards

function newGame() {
  const deck = [...SYMBOLS, ...SYMBOLS]
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
}

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}

newGame()
```
