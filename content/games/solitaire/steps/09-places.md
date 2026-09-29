---
title: A place for every pile
title_tr: Her yığına bir yer
skills: [prog.functions]
---

# --goal--

The table has seven columns, 64 pixels apart. The stock and the waste sit above columns 0 and 1, the foundations above
columns 3 to 6, and each tableau column in its own. `pileX` turns a pile's name into its x.

# --goal-tr--

Masayı yedi **sütuna** bölüyoruz: ilki soldan 16 piksel içeride, her biri öncekinden 64 piksel sağda. Üst sırada deste
0. sütunun, açılan kartlar 1. sütunun, dört temel 3. ile 6. sütunların üstünde durur. Alttaki yedi sütun da kendi
yerinde.

`pileX` (yığının x'i) fonksiyonu bir yığının **adından** yerini hesaplayacak. Adın ilk harfi türünü söyler: `f`
temel, `t` sütun.

# --code--

```js
const LEFT = 16
const COL = 64 // distance between columns

const colX = (i) => LEFT + i * COL

// Where each pile sits on the table.
function pileX(key) {
  if (key === 'stock') return colX(0)
  if (key === 'waste') return colX(1)
  if (key[0] === 'f') return colX(3 + Number(key[1]))
  return colX(Number(key[1]))
}
```

# --meaning--

- `colX(i)` is the x of column `i`: 16, 80, 144, …
- `key[0]` is the first letter of the name, `key[1]` the second. `Number('3')` turns the text `'3'` into the number 3.
- `if (...) return ...` answers and stops; the last line is for the tableau columns (`t0` to `t6`).

# --meaning-tr--

- `const LEFT = 16`, `const COL = 64` → ilk sütunun soldan uzaklığı ve iki sütun arası mesafe.
- `const colX = (i) => LEFT + i * COL` → `i`. sütunun x'i: 0 → 16, 1 → 80, 2 → 144...
- `if (key === 'stock') return colX(0)` → ad `'stock'` ise cevap 0. sütun; `return` cevabı verir ve fonksiyonu
  **bitirir**, alttaki satırlara hiç inilmez.
- `key[0]` → yazının **ilk harfi** (yazılar da diziler gibi 0'dan sayılır). `'f2'[0]` → `'f'`, `'f2'[1]` → `'2'`.
- `Number(key[1])` → `'2'` yazısını 2 **sayısına** çevirir. Temel `f2` → `colX(3 + 2)` → 5. sütun.
- Son satır → geriye yalnız sütunlar kaldı: `t4` → `colX(4)`.

# --task--

1. Under `const CH = 78` write `LEFT` and `COL`.
2. Under the `last` line write `colX`.
3. Under `deal` (after its closing `}`), leave an empty line and write `pileX` with its comment.

# --task-tr--

1. `const CH = 78` satırının altına `LEFT` ve `COL` satırlarını yaz.
2. `const last = ...` satırının altına `colX` satırını yaz.
3. `deal` fonksiyonunun kapanan `}`'sinden sonra bir boş satır bırak; yorumuyla birlikte `pileX` fonksiyonunu yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

For the foundations the column is `3 + Number(key[1])`: `f0` is column 3, `f3` column 6.

# --hint-tr--

Temeller için sütun `3 + Number(key[1])`: `f0` 3. sütun, `f3` 6. sütun.

# --tests--

`colX` should give 16, 80, 144… for columns 0, 1, 2…
tr: `colX` 0, 1, 2… sütunları için 16, 80, 144… vermeli.

```js
assert.deepEqual([colX(0), colX(1), colX(2), colX(6)], [16, 80, 144, 400])
```

`pileX` should put every pile in its column.
tr: `pileX` her yığını kendi sütununa koymalı.

```js
assert.deepEqual([pileX('stock'), pileX('waste')], [16, 80])
assert.deepEqual([pileX('f0'), pileX('f1'), pileX('f3')], [208, 272, 400])
assert.deepEqual([pileX('t0'), pileX('t2'), pileX('t6')], [16, 144, 400])
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
