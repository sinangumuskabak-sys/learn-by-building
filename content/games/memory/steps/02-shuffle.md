---
title: A fair shuffle
title_tr: Adil bir karıştırma
skills: [prog.arrays, prog.functions]
---

# --explanation--

The deck is every symbol twice, **shuffled**. The internet is full of this one-liner:

```js
deck.sort(() => Math.random() - 0.5)   // don't
```

It looks random, but it is **biased**: `sort` expects a consistent comparison, and when the answers are random, some
orders come out noticeably more often than others. In a card game, that means players can learn where pairs tend to
land.

The correct algorithm is the **Fisher–Yates shuffle**. Walk from the last position to the first; at each position `i`,
swap it with a random position from `0` to `i`:

```js
for (let i = items.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))   // 0 … i
  ;[items[i], items[j]] = [items[j], items[i]]    // swap
}
```

Every one of the possible orders is exactly equally likely, and it takes a single pass. Careful with a near miss:
swapping each position with a random position from the **whole** array (`0 … length - 1`) looks the same but is
biased too. The random range must shrink as `i` goes down. The swap uses array
destructuring; the leading `;` stops JavaScript from gluing the line onto the previous one.

Each card becomes an object that knows its symbol, its place in the grid, and whether it is face up. The drawing code
reads those fields instead of the loop counters.

# --explanation-tr--

Deste, her sembolün iki kez bulunduğu **karıştırılmış** bir listedir. İnternet şu tek satırla dolu:

```js
deck.sort(() => Math.random() - 0.5)   // yapma
```

Rastgele görünür ama **yanlıdır**: `sort` tutarlı bir karşılaştırma bekler; cevaplar rastgele olunca bazı sıralar
diğerlerinden gözle görülür biçimde daha sık çıkar. Bir kart oyununda bu, oyuncuların eşlerin genelde nereye düştüğünü
öğrenebileceği demektir.

Doğru algoritma **Fisher–Yates karıştırması**dır. Son konumdan ilkine doğru yürü; her `i` konumunda onu `0` ile `i`
arasındaki rastgele bir konumla takas et:

```js
for (let i = items.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))   // 0 … i
  ;[items[i], items[j]] = [items[j], items[i]]    // takas
}
```

Olası sıraların her biri tam olarak eşit olasılıklıdır ve tek bir geçiş yeter. Çok benzeyen bir hataya dikkat: her
konumu **tüm** dizideki (`0 … length - 1`) rastgele bir konumla takas etmek aynı görünür ama o da yanlıdır. `i` azaldıkça
rastgele aralık da daralmalı. Takas, dizi ayrıştırma kullanır; baştaki
`;` JavaScript'in satırı bir öncekine yapıştırmasını engeller.

Her kart; sembolünü, ızgaradaki yerini ve açık olup olmadığını bilen bir nesneye dönüşür. Çizim kodu döngü sayaçları
yerine bu alanları okur.

# --task--

1. Add `const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']`.
2. Write `function shuffle(items)` that shuffles the array **in place** with Fisher–Yates and returns it.
3. Add `let cards` and `function newGame()`: shuffle `[...SYMBOLS, ...SYMBOLS]` and turn it into 16 card objects
   `{ symbol, col: index % SIZE, row: Math.floor(index / SIZE), faceUp: false, matched: false }`. Call it at startup.
4. Write `cardX(card)` and `cardY(card)` using the formulas from the previous step, and a `draw()` that paints the
   background, then every card: face down as before, or face up as a `'#f8fafc'` square with its symbol drawn in the
   middle (`'44px sans-serif'`, centered horizontally and vertically). Call `draw()`.

# --task-tr--

1. `const SYMBOLS = ['🍎', '🍌', '🍇', '🍒', '🥝', '🍋', '🍉', '🍑']` ekle.
2. Diziyi Fisher–Yates ile **yerinde** karıştırıp döndüren `function shuffle(items)` yaz.
3. `let cards` ve `function newGame()` ekle: `[...SYMBOLS, ...SYMBOLS]`'u karıştır ve 16 kart nesnesine çevir:
   `{ symbol, col: index % SIZE, row: Math.floor(index / SIZE), faceUp: false, matched: false }`. Açılışta çağır.
4. Önceki adımdaki formüllerle `cardX(card)` ve `cardY(card)` yaz; arka planı, sonra her kartı boyayan bir `draw()`
   yaz: kapalıysa eskisi gibi, açıksa ortasına sembolü çizilmiş (`'44px sans-serif'`, yatay ve dikeyde ortalı)
   `'#f8fafc'` bir kare olarak. `draw()`'u çağır.

# --tests--

`shuffle()` should keep the same items, in place.
tr: `shuffle()` aynı elemanları yerinde tutmalı.

```js
const items = [1, 2, 3, 4, 5, 6]
const result = shuffle(items)
assert.strictEqual(result, items, 'shuffle the array you were given and return it')
assert.sameMembers(items, [1, 2, 3, 4, 5, 6])
```

`shuffle()` should make every order equally likely.
tr: `shuffle()` her sıralamayı eşit olasılıklı yapmalı.

```js
// 24000 shuffles of three items: each of the 6 orders should come up about 4000 times.
const counts = {}
for (let i = 0; i < 24000; i++) {
  const key = shuffle([1, 2, 3]).join('')
  counts[key] = (counts[key] || 0) + 1
}
assert.lengthOf(Object.keys(counts), 6, 'all 6 orders of three items should appear')
for (const [order, count] of Object.entries(counts)) {
  assert.isAbove(count, 3700, `order ${order} came up ${count} times out of 24000; expected about 4000`)
  assert.isBelow(count, 4300, `order ${order} came up ${count} times out of 24000; expected about 4000`)
}
```

There should be 16 cards: every symbol twice, placed on the grid.
tr: 16 kart olmalı: her sembol iki kez, ızgaraya yerleşmiş.

```js
assert.lengthOf(cards, 16)
assert.sameMembers(cards.map((c) => c.symbol), [...SYMBOLS, ...SYMBOLS])
assert.include(cards[0], { col: 0, row: 0, faceUp: false, matched: false })
assert.include(cards[6], { col: 2, row: 1 })
assert.include(cards[15], { col: 3, row: 3 })
assert.deepEqual([cardX(cards[6]), cardY(cards[6])], [206, 149])
```

A face-up card should show its symbol.
tr: Açık bir kart sembolünü göstermeli.

```js
cards[5].faceUp = true
draw()
assert.deepEqual($.texts(), [cards[5].symbol])
assert.deepEqual($.rects('#f8fafc'), [{ x: 109, y: 149, w: 85, h: 85, color: '#f8fafc' }])
assert.lengthOf($.rects('#6366f1'), 15)
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

// Fisher–Yates: every order is equally likely.
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

function newGame() {
  const deck = shuffle([...SYMBOLS, ...SYMBOLS])
  cards = deck.map((symbol, index) => ({
    symbol,
    col: index % SIZE,
    row: Math.floor(index / SIZE),
    faceUp: false,
    matched: false,
  }))
}

function cardX(card) {
  return GAP + card.col * (CARD + GAP)
}

function cardY(card) {
  return TOP + GAP + card.row * (CARD + GAP)
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = '44px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const card of cards) {
    const x = cardX(card)
    const y = cardY(card)
    if (card.faceUp) {
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x, y, CARD, CARD)
      ctx.fillText(card.symbol, x + CARD / 2, y + CARD / 2)
    } else {
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(x, y, CARD, CARD)
    }
  }
}

newGame()
draw()
```
